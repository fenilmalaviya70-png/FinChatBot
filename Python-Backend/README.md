# FinChatBot — Python AI Service

FastAPI-based AI service with RAG (Retrieval Augmented Generation), real chart generation, multi-language support, and agentic financial tools.

---

## 📋 Overview

- **Framework**: FastAPI + Uvicorn
- **LLM**: Groq (`llama-3.3-70b-versatile`)
- **Embeddings**: HuggingFace (`all-MiniLM-L6-v2`)
- **Vector DB**: FAISS (local, per-document namespace)
- **Port**: `5000`

---

## 🚀 Quick Start

```bash
# Navigate to Python-Backend directory
cd Python-Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
# GROQ_API_KEY=your_groq_key_here
# OPENROUTER_API_KEY=your_openrouter_key_here

# Start the service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# Alternative (using venv python directly):
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# Service will run at http://localhost:5000
```

---

## 📦 Installation

### Prerequisites
- Python 3.9+ installed
- Groq API key (free tier available)
- OpenRouter API key (free tier available)

### Step-by-Step Setup

1. **Create Virtual Environment**

```bash
# Using venv (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Alternative: Using Conda
conda create -n finchatbot python=3.9
conda activate finchatbot
```

2. **Install Dependencies**

```bash
pip install -r requirements.txt
```

**Note:** First installation may take 5-10 minutes as it downloads ML models.

3. **Configure Environment**

Create `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
VISION_PROVIDER=openrouter
VISION_MODEL=qwen/qwen2.5-vl-72b-instruct:free
MODEL_NAME=llama-3.3-70b-versatile
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
NODE_BACKEND_URL=http://localhost:8000
PORT=5000
```

**Get API Keys:**
- **Groq API**: https://console.groq.com/keys (Free tier: 30 requests/min)
- **OpenRouter API**: https://openrouter.ai/keys (Free tier available)

4. **Start the Service**

```bash
# Development mode (with auto-reload)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# Production mode
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4

# Using venv python directly (Windows):
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

---

## 🏃 Running the Python AI Service

### Development Mode (with auto-reload)
```bash
# Make sure virtual environment is activated
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### Production Mode
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4
```

### Using venv Python Directly (Windows)
```bash
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

**Expected Output:**
```
[LLM] Initializing Groq llama-3.3-70b-versatile
[VISION] OpenRouter vision enabled: qwen/qwen2.5-vl-72b-instruct:free
============================================================
FinChatBot Python AI Service Starting...
============================================================
Vector Store Path: ./vector_store
LLM Model: llama-3.3-70b-versatile
Embedding Model: sentence-transformers/all-MiniLM-L6-v2
Chunk Size: 1000
Top K Results: 5
============================================================
Service ready to accept requests
============================================================
INFO:     Uvicorn running on http://0.0.0.0:5000
INFO:     Application startup complete.
```

---

## 🌐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ | - | Groq LLM API key |
| `OPENROUTER_API_KEY` | ✅ | - | OpenRouter API key for vision |
| `VISION_PROVIDER` | ❌ | `openrouter` | Vision model provider |
| `VISION_MODEL` | ❌ | `qwen/qwen2.5-vl-72b-instruct:free` | Vision model name |
| `MODEL_NAME` | ❌ | `llama-3.3-70b-versatile` | LLM model name |
| `EMBEDDING_MODEL` | ❌ | `sentence-transformers/all-MiniLM-L6-v2` | Embedding model |
| `NODE_BACKEND_URL` | ✅ | `http://localhost:8000` | Node.js backend URL |
| `PORT` | ❌ | `5000` | Service port |

---

## 🧪 Testing the Service

### Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "FinChatBot Python AI Service is running"
}
```

### Test Query
```bash
curl -X POST http://localhost:5000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is financial analysis?",
    "chatHistory": [],
    "vectorNamespaces": [],
    "featureUsed": "General"
  }'
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/process-document` | Ingest document into FAISS vector store |
| `POST` | `/query` | RAG query with chart + suggestion generation |
| `POST` | `/delete-document` | Remove document vectors + file |
| `POST` | `/delete-documents` | Batch delete documents |
| `POST` | `/test-tools` | Test financial calculator tools |

### POST `/query` — Full Request/Response

**Request:**
```json
{
  "question": "Show me a pie chart of sales by region",
  "chatHistory": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}],
  "vectorNamespaces": ["doc-uuid-abc123"],
  "featureUsed": "Smart_Chart"
}
```

**Response:**
```json
{
  "answer": "Here is your Pie Chart based on the document.",
  "chart_data": {
    "type": "pie",
    "title": "Sales By Region",
    "labels": ["North America", "Europe", "Asia"],
    "datasets": [{"label": "Sales", "data": [400000, 300000, 200000], "color": "#3b82f6"}]
  },
  "citations": [{"page": 3, "snippet": "North America: 400,000", "confidence": 0.97}],
  "tool_calls": [],
  "suggestions": ["Show bar chart instead", "What is the total sales?", "Compare with Q3"]
}
```

### `featureUsed` Values

| Mode | Value |
|------|-------|
| General Q&A | `General` |
| Document Analysis | `Document_Analysis` |
| Smart Chart | `Smart_Chart` |
| Insights | `Insights` |

---

## Query Pipeline

```
User Question
     │
     ▼
_is_pure_chart_request()?
     │
 YES ├──────────────────────────────────────────────────┐
     │                                                  │
     │  CHART BYPASS PIPELINE                           │
     │  _handle_chart_request()                         │
     │  ┌─ LLM: JSON-extraction-only prompt             │
     │  ├─ Fallback: _build_fallback_chart() (regex)    │
     │  └─ Returns: short text + ChartData JSON         │
     │                                                  │
 NO  │  RAG PIPELINE                                    │
     │  ┌─ FAISS vector search (top-K chunks)           │
     │  ├─ Needs calculation? → agent with tools        │
     │  ├─ Else → standard RAG prompt                   │
     │  ├─ _detect_chart_opportunity() → chart gen      │
     │  └─ _clean_answer() strips ASCII art             │
     │                                                  │
     └──────────────────────────────────────────────────┘
           │
           ▼
    _generate_suggestions() → 3 follow-up questions
           │
           ▼
      QueryResponse{answer, chart_data, citations, suggestions}
```

---

## Project Structure

```
Python-Backend/
├── app/
│   ├── main.py                   # FastAPI entry point
│   ├── api/
│   │   └── routes.py             # All HTTP endpoints
│   ├── agent/
│   │   ├── calculator.py         # Financial math tools
│   │   └── orchestrator.py       # Agent with tool calling
│   ├── config/
│   │   ├── settings.py           # Environment config (Pydantic)
│   │   └── prompts.py            # System prompts
│   ├── models/
│   │   └── schemas.py            # Request/Response Pydantic models
│   └── services/
│       ├── enhanced_rag_service.py  # Main RAG + chart service
│       ├── document_processor.py   # PDF → chunks → FAISS
│       ├── vector_store.py         # FAISS wrapper
│       └── rag_service.py          # Legacy simple RAG
├── vector_store/                 # FAISS indices (gitignored)
├── uploads/                      # Uploaded PDFs (gitignored)
├── requirements.txt
└── .env
```

---

## Chart Types Supported

| User says | Chart type |
|-----------|-----------|
| "bar chart", "bar graph", "column" | `bar` |
| "line chart", "line graph", "trend" | `line` |
| "pie chart", "pie", "donut" | `pie` |
| "area chart", "area graph" | `area` |

---

## Financial Tools (Agent)

| Tool | Description |
|------|-------------|
| `calculate(expr)` | Evaluate math expressions safely |
| `calculate_growth(old, new)` | YoY growth percentage |
| `calculate_ratio(num, den, name)` | Financial ratios (ROE, etc.) |
| `calculate_cagr(start, end, years)` | CAGR calculation |
| `calculate_margin(profit, revenue, type)` | Profit/net margin |
