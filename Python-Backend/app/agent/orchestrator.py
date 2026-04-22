"""
Agent Orchestrator
Manages tool calling and agent execution flow
"""

import json
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

from app.config.settings import settings
from app.agent.tools import get_financial_tools, get_tool_function


class AgentOrchestrator:
    """
    Orchestrates AI agent with tool calling capabilities
    Manages the flow: Question → Tool Calls → Final Answer
    """
    
    def __init__(self):
        """Initialize orchestrator with tool-enabled LLM"""
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=2000,
            openai_api_key=settings.GROQ_API_KEY,
            openai_api_base="https://api.groq.com/openai/v1",
        )
        
        # Bind tools to LLM
        self.tools = get_financial_tools()
        self.llm_with_tools = self.llm.bind_tools(self.tools)
    
    def _execute_tool(self, tool_name: str, tool_args: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool function
        
        Args:
            tool_name: Name of the tool to execute
            tool_args: Arguments for the tool
            
        Returns:
            Tool execution result
        """
        print(f"[TOOL] Executing: {tool_name}")
        print(f"[ARGS] {tool_args}")
        
        tool_func = get_tool_function(tool_name)
        
        if tool_func is None:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}"
            }
        
        try:
            result = tool_func(**tool_args)
            print(f"[RESULT] {result}")
            return result
        except Exception as e:
            print(f"[ERROR] Tool execution failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def run_agent(
        self,
        question: str,
        context: str,
        chat_history: List[Dict[str, str]] = None,
        max_iterations: int = 5
    ) -> Dict[str, Any]:
        """
        Run agent with tool calling
        
        Args:
            question: User's question
            context: Retrieved document context
            chat_history: Previous conversation
            max_iterations: Maximum tool calling iterations
            
        Returns:
            Dictionary with answer and tool calls
        """
        print(f"\n[AGENT] Starting agent orchestration")
        print(f"[AGENT] Max iterations: {max_iterations}")
        
        # Build system message
        system_msg = SystemMessage(content=f"""You are a financial analyst AI assistant with access to calculation tools.

CONTEXT FROM DOCUMENTS:
{context}

INSTRUCTIONS:
1. Use the provided tools for ANY numerical calculations to ensure accuracy
2. Extract exact numbers from the context
3. When asked to calculate growth, ratios, or margins, use the appropriate tool
4. Always cite the source of your numbers (page numbers from context)
5. Provide clear explanations of your calculations

AVAILABLE TOOLS:
- calculate_expression: For custom math expressions
- calculate_growth_rate: For YoY, QoQ growth calculations
- calculate_financial_ratio: For ROE, ROA, Debt/Equity, etc.
- calculate_cagr: For compound annual growth rate
- calculate_margin: For profit margins

Remember: Use tools for calculations, don't compute in your head!""")
        
        # Build message history
        messages = [system_msg]
        
        # Add chat history if provided
        if chat_history:
            for msg in chat_history[-4:]:  # Last 4 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "user":
                    messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    messages.append(AIMessage(content=content))
        
        # Add current question
        messages.append(HumanMessage(content=question))
        
        # Agent loop
        tool_calls_made = []
        iteration = 0
        
        while iteration < max_iterations:
            iteration += 1
            print(f"\n[AGENT] Iteration {iteration}/{max_iterations}")
            
            # Get LLM response
            response = self.llm_with_tools.invoke(messages)
            messages.append(response)
            
            # Check if LLM wants to use tools
            if not response.tool_calls:
                # No more tool calls, we have final answer
                print(f"[AGENT] No tool calls, final answer ready")
                break
            
            # Execute each tool call
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                tool_id = tool_call["id"]
                
                # Execute tool
                tool_result = self._execute_tool(tool_name, tool_args)
                
                # Record tool call
                tool_calls_made.append({
                    "tool": tool_name,
                    "args": tool_args,
                    "result": tool_result
                })
                
                # Add tool result to messages
                tool_message = ToolMessage(
                    content=json.dumps(tool_result),
                    tool_call_id=tool_id
                )
                messages.append(tool_message)
        
        # Extract final answer
        final_answer = response.content if hasattr(response, 'content') else str(response)
        
        print(f"\n[AGENT] Completed with {len(tool_calls_made)} tool calls")
        
        return {
            "answer": final_answer,
            "tool_calls": tool_calls_made,
            "iterations": iteration
        }
    
    async def run_simple(
        self,
        question: str,
        context: str,
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """
        Simplified agent run that returns just the answer
        
        Args:
            question: User's question
            context: Retrieved document context
            chat_history: Previous conversation
            
        Returns:
            Final answer string
        """
        result = await self.run_agent(question, context, chat_history)
        return result["answer"]


# Global orchestrator instance
agent_orchestrator = AgentOrchestrator()
