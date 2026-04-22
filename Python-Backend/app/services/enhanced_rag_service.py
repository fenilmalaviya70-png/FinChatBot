"""
Enhanced RAG Service with Agentic Tools and Chart Generation
Combines retrieval, tool calling, and structured output
"""

from typing import List, Dict, Optional, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
import json
import re

from app.config.settings import settings
from app.services.vector_store import vector_store
from app.agent.orchestrator import agent_orchestrator
from app.models.schemas import ChartData, Citation
import traceback


class EnhancedRAGService:
    """
    Enhanced RAG Service with:
    - Agentic tool calling for calculations
    - Automatic chart data generation
    - Source citations
    """
    
    def __init__(self):
        """Initialize enhanced RAG service with configured provider"""
        if settings.LLM_PROVIDER.lower() == "openai" and settings.OPENAI_API_KEY:
            print(f"[LLM] Initializing OpenAI {settings.LLM_MODEL}")
            self.llm = ChatOpenAI(
                model=settings.LLM_MODEL,
                temperature=settings.LLM_TEMPERATURE,
                max_tokens=settings.LLM_MAX_TOKENS,
                openai_api_key=settings.OPENAI_API_KEY,
            )
        else:
            # Default: Use Groq (free, fast, no billing required)
            print(f"[LLM] Initializing Groq {settings.LLM_MODEL}")
            self.llm = ChatOpenAI(
                model=settings.LLM_MODEL,
                temperature=settings.LLM_TEMPERATURE,
                max_tokens=settings.LLM_MAX_TOKENS,
                openai_api_key=settings.GROQ_API_KEY,
                openai_api_base="https://api.groq.com/openai/v1",
            )
    
    def _format_documents(self, docs: List[Document]) -> str:
        """Format retrieved documents into context string with truncation"""
        if not docs:
            return "No relevant context found."
        
        # Limit total docs to prevent token overflow (max 10 chunks total)
        docs = docs[:10]
        
        formatted = "\n\n---\n\n".join([
            f"[Page {doc.metadata.get('page', 'N/A')}] {doc.page_content}"
            for doc in docs
        ])
        
        # Absolute truncation based on characters to protect rate limits
        if len(formatted) > settings.MAX_CONTEXT_CHARACTERS:
            print(f"[WARNING] Context truncated from {len(formatted)} to {settings.MAX_CONTEXT_CHARACTERS} characters")
            formatted = formatted[:settings.MAX_CONTEXT_CHARACTERS] + "\n\n[Context truncated due to size limits...]"
            
        return formatted
    
    def _extract_citations(self, docs: List[Document]) -> List[Citation]:
        """Extract citations from retrieved documents"""
        citations = []
        for doc in docs[:3]:
            citations.append(Citation(
                page=doc.metadata.get('page', 0),
                snippet=doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                confidence=doc.metadata.get('score', 1.0)
            ))
        return citations

    def _clean_answer(self, answer: str) -> str:
        """
        Strip ASCII chart art and text-based chart representations from the LLM answer.
        Called when a real chart will be rendered by the frontend.
        """
        lines = answer.split('\n')
        cleaned = []
        skip_block = False

        ascii_triggers = [
            'simple text-based representation',
            'ascii art',
            'text-based chart',
            'text representation',
            'cannot draw',
            'i cannot render',
            'not actual graphical',
            'simple ascii',
            'text-based bar',
            'text-based pie',
        ]

        for line in lines:
            stripped = line.strip()
            lower = stripped.lower()

            # Detect start of skip block
            if any(t in lower for t in ascii_triggers):
                skip_block = True
                continue

            # Pure ASCII art lines (made of * | - characters mostly)
            pure_ascii = re.sub(r'[\*\|\-\s\+\(\)\d%,\.]+', '', stripped)
            if len(stripped) > 5 and len(pure_ascii) < 3:
                continue  # Skip — it's all symbols

            # Lines that look like bar chart row: "Label | *** (number)"
            if re.match(r'^.{1,30}\s*[\|:]\s*[\*\-]{3,}', stripped):
                continue

            # Lines that look like table separators
            if re.match(r'^[\|\-\s\+]{5,}$', stripped):
                continue

            # Reset skip block on blank or real text
            if not stripped:
                skip_block = False

            if not skip_block:
                cleaned.append(line)

        result = '\n'.join(cleaned)
        # Collapse multiple blank lines into one
        result = re.sub(r'\n{3,}', '\n\n', result)
        return result.strip()

    def _build_fallback_chart(
        self,
        question: str,
        context: str,
        answer: str
    ) -> Optional[ChartData]:
        """
        Fallback: extract numbers + labels from the answer/context using regex
        and build a real chart when LLM JSON generation fails.
        """
        chart_type = self._extract_chart_type(question)
        colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

        # Combine answer and context for extraction
        text = answer + "\n" + context[:2000]

        # Pattern: "Label: number" or "Label | number" or "Label (number%)"
        patterns = [
            r'([A-Za-z][A-Za-z\s&]{1,25})\s*[:\|]\s*([\d,]+(?:\.\d+)?)',
            r'([A-Za-z][A-Za-z\s&]{1,25})\s*\(([\d,]+(?:\.\d+)?)\s*%?\)',
            r'(Month\s*\d+|Q[1-4]\s*\d{4}?|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*[:\|]?\s*([\d,]+(?:\.\d+)?)',
        ]

        label_value_pairs = {}
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                label = m.group(1).strip()
                raw_val = m.group(2).replace(',', '')
                try:
                    value = float(raw_val)
                    if value > 0 and label not in label_value_pairs:
                        label_value_pairs[label] = value
                except ValueError:
                    pass

        # Need at least 2 data points for a chart
        if len(label_value_pairs) < 2:
            return None

        # Keep top 8 entries
        items = sorted(label_value_pairs.items(), key=lambda x: x[1], reverse=True)[:8]
        labels = [k for k, _ in items]
        values = [v for _, v in items]

        # Generate title from question
        title = question.strip('?').title()[:60]

        dataset = {"label": "Value", "data": values, "color": colors[0]}
        for i, c in enumerate(colors[1:], 1):
            if i < len(colors):
                colors[i] = c

        if chart_type == 'pie':
            colored_datasets = [{"label": "Distribution", "data": values, "color": colors[0]}]
        else:
            colored_datasets = [
                {"label": labels[i] if len(labels) > 2 else "Value",
                 "data": values,
                 "color": colors[0]}
            ]

        print(f"[CHART] 🔄 Fallback chart built: {chart_type} with {len(labels)} items")
        return ChartData(type=chart_type, title=title, labels=labels, datasets=colored_datasets)

    def _detect_chart_opportunity(self, question: str, context: str) -> bool:
        """
        Detect if question involves charts, graphs, or comparative data.
        Catches direct requests: 'give charts', 'show graph', 'visualize', etc.
        """
        # Explicit chart request keywords (highest priority — always trigger)
        explicit_chart_keywords = [
            'chart', 'graph', 'plot', 'visualize', 'visualise',
            'show me', 'draw', 'diagram', 'visual', 'bar chart',
            'pie chart', 'line chart', 'line graph', 'histogram',
            'scatter', 'infographic'
        ]

        # Data keywords that suggest chart-worthy context
        data_keywords = [
            'trend', 'growth', 'over time', 'comparison', 'compare',
            'year', 'quarter', 'month', 'period', 'historical',
            'revenue', 'profit', 'sales', 'performance', 'change'
        ]

        question_lower = question.lower()

        # If user explicitly asks for charts — always generate one
        if any(kw in question_lower for kw in explicit_chart_keywords):
            return True

        # Data-driven detection: keyword + multiple numbers
        has_data_keyword = any(kw in question_lower for kw in data_keywords)
        numbers_in_context = re.findall(r'\d+(?:,\d{3})*(?:\.\d+)?', context)
        has_multiple_numbers = len(numbers_in_context) >= 3

        return has_data_keyword and has_multiple_numbers
    
    def _extract_chart_type(self, question: str) -> str:
        """Detect the chart type explicitly requested in the question."""
        q = question.lower()
        if any(w in q for w in ['pie chart', 'pie graph', 'pie', 'donut', 'doughnut']):
            return 'pie'
        if any(w in q for w in ['area chart', 'area graph', 'area']):
            return 'area'
        if any(w in q for w in ['line chart', 'line graph', 'line', 'trend', 'over time']):
            return 'line'
        if any(w in q for w in ['bar chart', 'bar graph', 'bar', 'column', 'histogram']):
            return 'bar'
        return 'bar'

    def _is_pure_chart_request(self, question: str) -> bool:
        """
        Returns True if the user's PRIMARY intent is to see a chart/graph visualization.
        These questions should bypass the RAG answer and go directly to chart generation.
        """
        q = question.lower().strip()
        chart_intent_phrases = [
            'show me', 'give me', 'create', 'generate', 'make', 'draw', 'display',
            'plot', 'visualize', 'visualise', 'show a', 'give a', 'i want',
            'provide', 'can you show', 'can you give', 'produce'
        ]
        chart_nouns = [
            'chart', 'graph', 'plot', 'pie', 'bar', 'line', 'area', 'donut',
            'histogram', 'visualization', 'diagram', 'visual'
        ]
        has_intent = any(phrase in q for phrase in chart_intent_phrases)
        has_noun = any(noun in q for noun in chart_nouns)
        return has_intent and has_noun

    async def _handle_chart_request(
        self,
        question: str,
        context: str,
        chat_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        DEDICATED CHART PIPELINE — completely separate from the RAG answer pipeline.
        Used when user explicitly asks for a chart/graph.
        
        Steps:
        1. Run a data-extraction-only LLM call (NOT a chat completion)
        2. Build chart JSON
        3. Return a minimal confirmation text + the chart JSON
        NO general-purpose answer is generated, so no ASCII art can appear.
        """
        chart_type = self._extract_chart_type(question)
        colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

        # === Step 1: LLM data extraction (strict JSON-only prompt) ===
        extraction_prompt = f"""ROLE: You are a JSON data extractor. You output ONLY valid JSON. Nothing else.

TASK: From the financial document text below, extract numerical data and return a {chart_type} chart JSON.

DOCUMENT DATA:
{context[:3000]}

OUTPUT FORMAT (return ONLY this JSON, no text before or after):
{{"type": "{chart_type}", "title": "Short Chart Title", "labels": ["Label1", "Label2", "Label3"], "datasets": [{{"label": "Series", "data": [100, 200, 150], "color": "{colors[0]}"}}]}}

RULES:
- Output ONLY the JSON object. No explanation. No intro. No markdown. No ASCII art.
- type = "{chart_type}" exactly
- Use real numbers from the document
- For pie: one dataset, multiple labels
- For bar/line/area: one or more datasets
- data values must be plain numbers (no commas, no units)

JSON:"""

        chart_data = None
        try:
            response = self.llm.invoke(extraction_prompt)
            raw = response.content.strip()
            print(f"[CHART-PIPELINE] Extraction response: {raw[:200]}")

            # Strip markdown fences
            raw = re.sub(r'```(?:json)?\s*', '', raw).replace('```', '').strip()

            # Extract JSON
            m = re.search(r'\{[\s\S]*\}', raw)
            if m:
                j = json.loads(m.group())
                if not j.get('no_chart') and all(k in j for k in ['type', 'title', 'labels', 'datasets']):
                    j['type'] = chart_type  # Force correct type
                    # Sanitise numeric values
                    for ds in j.get('datasets', []):
                        ds['data'] = [float(str(v).replace(',', '')) for v in ds.get('data', []) if v is not None]
                    # Assign colors if missing
                    for i, ds in enumerate(j.get('datasets', [])):
                        if not ds.get('color'):
                            ds['color'] = colors[i % len(colors)]
                    chart_data = ChartData(**j)
                    print(f"[CHART-PIPELINE] ✅ LLM chart extracted: {chart_type}")
        except Exception as e:
            print(f"[CHART-PIPELINE] LLM extraction failed: {e}")

        # === Step 2: Fallback — regex extraction from context ===
        if not chart_data:
            print("[CHART-PIPELINE] Trying regex fallback...")
            chart_data = self._build_fallback_chart(question, context, "")

        # === Step 3: Compose minimal text answer (no ASCII art possible) ===
        chart_name = chart_type.capitalize()
        if chart_data:
            text_answer = (
                f"Here is your **{chart_name} Chart** rendered below, "
                f"based on the data extracted from your document. "
                f"The chart shows **{chart_data.title}** with {len(chart_data.labels)} data points."
            )
        else:
            text_answer = (
                f"I couldn't find enough numerical data in the document to generate a {chart_name} chart. "
                f"Please make sure your document contains tables or numerical values."
            )

        # === Step 4: Generate suggestions ===
        suggestions = await self._generate_suggestions(question, text_answer)

        return {
            "answer": text_answer,
            "chart_data": chart_data,
            "citations": [],
            "tool_calls": [],
            "suggestions": suggestions
        }

    async def _generate_chart_data(
        self,
        question: str,
        context: str,
        answer: str
    ) -> Optional[ChartData]:
        """
        Generate real chart data (JSON) from the document context.
        Detects the requested chart type and forces it in the prompt.
        """
        chart_type = self._extract_chart_type(question)
        colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

        chart_prompt = f"""You are a data extraction assistant. Extract numerical data from the text below and return it as a JSON chart.

QUESTION ASKED: {question}
CHART TYPE REQUESTED: {chart_type}

DATA FROM DOCUMENT:
{context[:2000]}

ADDITIONAL DATA FROM ANSWER:
{answer[:800]}

TASK: Extract real numbers from the text above and build a {chart_type} chart JSON.

Rules:
- Use ONLY numbers that actually appear in the text
- type MUST be exactly: "{chart_type}"
- labels: list of time periods, categories, or names (strings)
- datasets: list of objects with "label" (string), "data" (list of numbers), "color" (hex string)
- For pie chart: use ONE dataset with multiple values
- All data values must be actual numbers (no strings, no null)
- Return ONLY the JSON object. No explanation. No markdown fences.

REQUIRED FORMAT (return exactly like this):
{{"type": "{chart_type}", "title": "Descriptive Chart Title", "labels": ["Label1", "Label2"], "datasets": [{{"label": "Series Name", "data": [100, 200], "color": "{colors[0]}"}}]}}"""

        try:
            response = self.llm.invoke(chart_prompt)
            response_text = response.content.strip()
            print(f"[CHART] Raw LLM response: {response_text[:300]}")

            # Strip markdown code fences if present
            if '```' in response_text:
                response_text = re.sub(r'```(?:json)?\s*', '', response_text)
                response_text = response_text.replace('```', '').strip()

            # Try to find and parse JSON
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if not json_match:
                print("[CHART] No JSON found in response")
                return None

            chart_json = json.loads(json_match.group())

            # Reject if no_chart flag
            if chart_json.get('no_chart'):
                return None

            # Force the correct chart type
            chart_json['type'] = chart_type

            # Validate required fields
            required = ['type', 'title', 'labels', 'datasets']
            if not all(k in chart_json for k in required):
                print(f"[CHART] Missing required fields: {[k for k in required if k not in chart_json]}")
                return None

            # Validate datasets have numeric data
            for ds in chart_json.get('datasets', []):
                if not isinstance(ds.get('data', []), list) or not ds['data']:
                    return None
                # Ensure all values are numbers
                ds['data'] = [float(str(v).replace(',', '')) if v is not None else 0 for v in ds['data']]

            # Add default colors if missing
            for i, ds in enumerate(chart_json['datasets']):
                if not ds.get('color'):
                    ds['color'] = colors[i % len(colors)]

            print(f"[CHART] ✅ Chart JSON parsed: {chart_type} with {len(chart_json['labels'])} labels")
            return ChartData(**chart_json)

        except json.JSONDecodeError as e:
            print(f"[CHART] JSON parse error: {e}")
            return None
        except Exception as e:
            print(f"[WARNING] Chart generation failed: {e}")
            return None

    async def _generate_suggestions(
        self,
        question: str,
        answer: str,
        context: str = ""
    ) -> List[str]:
        """
        Generate 3 smart follow-up question suggestions based on the answer.
        """
        try:
            prompt = f"""Based on this financial Q&A, generate exactly 3 short follow-up questions a user might ask next.

Question: {question}
Answer: {answer[:500]}

Rules:
- Each question must be under 12 words
- Make them specific and actionable
- Return ONLY a JSON array of 3 strings, nothing else
- Example: ["What was Q4 revenue?", "Show me a bar chart", "Compare with last year"]

JSON array:"""

            response = self.llm.invoke(prompt)
            text = response.content.strip()

            # Extract JSON array
            json_match = re.search(r'\[.*?\]', text, re.DOTALL)
            if json_match:
                suggestions = json.loads(json_match.group())
                if isinstance(suggestions, list):
                    return [str(s) for s in suggestions[:3]]
        except Exception as e:
            print(f"[WARNING] Suggestion generation failed: {e}")

        # Fallback suggestions
        return [
            "Show me this data as a chart",
            "What are the key insights?",
            "Compare with previous period"
        ]
    
    async def query_with_agent(
        self,
        question: str,
        chat_history: List[Dict[str, str]],
        namespaces: List[str],
        enable_tools: bool = True,
        enable_charts: bool = True
    ) -> Dict[str, Any]:
        """
        Enhanced query with agent tools and chart generation
        
        Args:
            question: User's question
            chat_history: Previous conversation
            namespaces: Document namespaces to search
            enable_tools: Enable agentic tool calling
            enable_charts: Enable chart generation
            
        Returns:
            Dictionary with answer, chart_data, citations, tool_calls
        """
        print(f"\n{'='*60}")
        print(f"📥 Enhanced Query")
        print(f"Question: {question[:100]}...")
        print(f"Tools: {'Enabled' if enable_tools else 'Disabled'}")
        print(f"Charts: {'Enabled' if enable_charts else 'Disabled'}")
        print(f"{'='*60}")
        
        # If no documents, answer from general financial knowledge
        if not namespaces:
            print("[RAG] No document namespaces provided — answering from general knowledge")
            general_answer = await self._answer_general(question, chat_history)
            suggestions = await self._generate_suggestions(question, general_answer)
            return {
                "answer": general_answer,
                "chart_data": None,
                "citations": [],
                "tool_calls": [],
                "suggestions": suggestions
            }
        
        # Retrieve relevant context
        print(f"[SEARCH] Searching {len(namespaces)} document(s)...")
        relevant_docs = vector_store.search(
            query=question,
            namespaces=namespaces,
            k=settings.TOP_K_RESULTS
        )
        
        if not relevant_docs:
            return {
                "answer": "I couldn't find relevant information in the uploaded documents.",
                "chart_data": None,
                "citations": [],
                "tool_calls": []
            }
        
        print(f"[OK] Retrieved {len(relevant_docs)} relevant chunks")

        # Format context
        context = self._format_documents(relevant_docs)

        # Extract citations
        citations = self._extract_citations(relevant_docs)

        # ─── CHART BYPASS ────────────────────────────────────────────
        # If user's primary intent is visualization, skip the RAG answer
        # entirely and use the dedicated chart pipeline (no ASCII art possible)
        if enable_charts and self._is_pure_chart_request(question):
            print("[CHART-PIPELINE] 🎯 Pure chart request detected — bypassing RAG answer")
            result = await self._handle_chart_request(question, context, chat_history)
            result["citations"] = citations  # attach doc citations
            return result
        # ─────────────────────────────────────────────────────────────

        # Decide whether to use agent with tools
        needs_calculation = any(keyword in question.lower() for keyword in [
            'calculate', 'compute', 'growth', 'ratio', 'margin', 'cagr',
            'percentage', 'increase', 'decrease', 'change', 'compare'
        ])

        # Will a chart be rendered below? Tell the LLM not to make ASCII art
        will_render_chart = enable_charts and self._detect_chart_opportunity(question, context)
        chart_instruction = (
            "\n\nIMPORTANT: The user's question requests a chart. "
            "A real interactive chart will be rendered automatically below your response. "
            "Do NOT draw ASCII art, text tables, or text-based chart representations. "
            "Just explain the data in plain text — brief, clear bullet points. "
            "Do not say 'here is a chart' or 'I cannot draw' — just give the data summary."
        ) if will_render_chart else ""

        if enable_tools and needs_calculation:
            print("[AGENT] Using agent with tools")
            result = await agent_orchestrator.run_agent(
                question=question,
                context=context,
                chat_history=chat_history
            )
            answer = result["answer"]
            tool_calls = result["tool_calls"]
        else:
            print("[RAG] Using standard RAG (no tools needed)")
            prompt = PromptTemplate.from_template(
                "You are a financial analyst AI assistant.\n\n"
                "CONTEXT FROM DOCUMENTS:\n{context}\n\n"
                "QUESTION: {question}\n{chart_instruction}\n\n"
                "Provide a clear, accurate answer. Cite page numbers when possible. "
                "Be concise — no ASCII art or text-based charts.\n\nANSWER:"
            )
            chain = prompt | self.llm | StrOutputParser()
            answer = chain.invoke({
                "context": context,
                "question": question,
                "chart_instruction": chart_instruction
            })
            tool_calls = []
        
        # Generate chart data if appropriate
        chart_data = None
        if enable_charts and will_render_chart:
            print("[CHART] Generating chart data from LLM...")
            chart_data = await self._generate_chart_data(question, context, answer)
            if chart_data:
                print(f"[OK] Chart generated via LLM: {chart_data.type} — {chart_data.title}")
            else:
                # Fallback: extract numbers with regex and build chart directly
                print("[CHART] LLM JSON failed — trying regex fallback...")
                chart_data = self._build_fallback_chart(question, context, answer)
                if chart_data:
                    print(f"[OK] Fallback chart built: {chart_data.type} — {chart_data.title}")

            # Clean ASCII art from the answer text (always, when chart will render)
            answer = self._clean_answer(answer)

        # Generate suggestions for follow-up questions
        suggestions = await self._generate_suggestions(question, answer)

        print(f"\n{'='*60}")
        print(f"[OK] Query completed")
        print(f"Tool calls: {len(tool_calls)}")
        print(f"Chart: {'Yes' if chart_data else 'No'}")
        print(f"Citations: {len(citations)}")
        print(f"{'='*60}\n")

        return {
            "answer": answer,
            "chart_data": chart_data,
            "citations": citations,
            "tool_calls": tool_calls,
            "suggestions": suggestions
        }

    async def _answer_general(
        self,
        question: str,
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """
        Answer a question from general LLM knowledge when no documents are uploaded.
        Useful for financial concepts, formulas, and general questions.
        """
        from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

        system_prompt = SystemMessage(content=(
            "You are a knowledgeable financial analyst AI assistant. "
            "Answer questions about finance, accounting, and business clearly and helpfully. "
            "If asked to create charts or analyze specific data from a document, "
            "politely mention that uploading a document will give more precise results, "
            "but still provide a helpful general answer."
        ))

        messages = [system_prompt]

        if chat_history:
            for msg in (chat_history or [])[-4:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "user":
                    messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    messages.append(AIMessage(content=content))

        messages.append(HumanMessage(content=question))

        response = self.llm.invoke(messages)
        return response.content if response.content else "I'm sorry, I couldn't generate a response."


# Global enhanced RAG service instance
enhanced_rag_service = EnhancedRAGService()
