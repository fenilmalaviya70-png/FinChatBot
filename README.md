# 💰 FinChatBot — AI-Powered Financial Analysis Chatbot

> An intelligent, multi-language financial chatbot that analyzes uploaded documents, generates real-time charts, answers questions in 3 languages, and exports reports to PDF, Excel, and Word.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [ER Diagram](#er-diagram)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Features](#features)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🧠 Overview

FinChatBot is a full-stack AI application that lets users:
1. Upload financial PDFs/documents
2. Ask questions in **English, Hindi, or Gujarati**
3. Get AI-powered answers with **real rendered charts** (bar, line, pie, area)
4. Receive **smart follow-up suggestions** after every response
5. Switch between **4 feature modes**: General, Document Analysis, Smart Chart, Insights
6. Export conversations to **PDF, Excel (.xlsx), or Word (.doc)**

### Architecture Overview

```
╔══════════════════════════════════════════════════════════════╗
║                        FRONTEND (React)                      ║
║            Port 5173 — Vite + Tailwind + Recharts            ║
╚══════════════════╦══════════════════════════════════════════╝
                   ║ HTTP / WebSocket
       ┌───────────▼───────────┐
       │   NODE.JS BACKEND      │  ← REST API + Socket.IO
       │     Port 8000          │  ← Conversations, Documents, Auth
       │   Express + MongoDB    │
       └───────────┬────────────┘
                   ║ HTTP (internal)
       ┌───────────▼───────────┐
       │   PYTHON AI SERVICE    │  ← FastAPI + RAG
       │     Port 8001          │  ← LLM, Charts, Vector Search
       │ LangChain + FAISS      │
       └───────────────────────┘
```

---

## 🔩 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, jsPDF, xlsx, html2canvas |
| **Node.js API** | Express.js, MongoDB, Mongoose, Socket.IO, Multer, Axios |
| **Python AI** | FastAPI, LangChain, FAISS, Groq LLM, HuggingFace Embeddings |
| **Database** | MongoDB Atlas (cloud) |
| **AI/LLM** | Groq (llama-3.3-70b), OpenRouter (vision models) |
| **Vector DB** | FAISS (local, per document namespace) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    FRONTEND  :5173                               │
│  ┌─────────────┐ ┌────────────┐ ┌───────────┐ ┌─────────────┐  │
│  │ ChatPageNew │ │ ChatWindow │ │ ChartCard │ │ExportReports│  │
│  │ (state mgmt)│ │(UI + modes)│ │(Recharts) │ │(PDF/Excel)  │  │
│  └──────┬──────┘ └─────┬──────┘ └─────┬─────┘ └─────────────┘  │
│         │              │              │                          │
│  ┌──────▼──────────────▼──────────────▼──────────────────────┐  │
│  │              api.js (Axios client)                         │  │
│  │   conversationAPI | documentAPI | aiAPI (Python direct)    │  │
│  └──────────────┬─────────────────────┬───────────────────────┘  │
└─────────────────┼─────────────────────┼─────────────────────────┘
                  │ :8000                │ :8001
┌─────────────────▼────────────┐  ┌─────▼──────────────────────────┐
│     NODE.JS BACKEND          │  │     PYTHON AI SERVICE           │
│  Express + Socket.IO         │  │  FastAPI + LangChain + FAISS   │
│                              │  │                                 │
│  ┌─────────────────────────┐ │  │ ┌──────────────────────────┐   │
│  │ /api/conversations      │ │  │ │ EnhancedRAGService       │   │
│  │ /api/documents          │ │  │ │ - query_with_agent()     │   │
│  └─────────────────────────┘ │  │ │ - _handle_chart_request()│   │
│  ┌─────────────────────────┐ │  │ │ - _generate_suggestions()│   │
│  │    MongoDB Models        │ │  │ └─────────┬────────────────┘   │
│  │  Conversation | Message  │ │  │           │                    │
│  │  Document                │ │  │ ┌─────────▼────────────────┐   │
│  └──────────┬───────────────┘ │  │ │  FAISS Vector Store      │   │
│             │ Socket.IO       │  │ │  (per-document namespace) │   │
│  ┌──────────▼───────────────┐ │  │ └──────────────────────────┘   │
│  │    Socket.IO Events      │ │  │ ┌──────────────────────────┐   │
│  │ document:processing      │ │  │ │  Groq LLM API            │   │
│  │ document:completed       │ │  │ │  llama-3.3-70b-versatile │   │
│  └─────────────────────────┘ │  │ └──────────────────────────┘   │
└─────────────────┬────────────┘  └────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  MongoDB Atlas   │
         │  Collections:    │
         │  - conversations │
         │  - messages      │
         │  - documents     │
         └─────────────────┘
```

---

## 🗄️ ER Diagram

```
┌──────────────────────────────────────────┐
│               CONVERSATION               │
├──────────────────────────────────────────┤
│  _id          ObjectId  (PK)             │
│  title        String                     │
│  status       String  [active|archived]  │
│  createdAt    Date                       │
│  updatedAt    Date                       │
└───────────────────┬──────────────────────┘
                    │ 1
                    │
            ┌───────┴──────────────────────────────┐
            │                                      │
            │ *                                    │ *
┌───────────▼──────────────────────┐  ┌───────────▼──────────────────────┐
│            MESSAGE               │  │           DOCUMENT               │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│  _id           ObjectId  (PK)    │  │  _id           ObjectId  (PK)    │
│  conversationId ObjectId (FK)    │  │  conversationId ObjectId (FK)    │
│  role          String            │  │  fileName       String           │
│                [user|assistant   │  │  originalName   String           │
│                 |system]         │  │  filePath       String           │
│  content       String            │  │  fileType       String           │
│  timestamp     Date              │  │  fileSize       Number           │
│  feedback      String (optional) │  │  vectorNamespace String         │
│  chart_data    Object (optional) │  │  status         String           │
│  citations     Array  (optional) │  │           [pending|processing    │
│  suggestions   Array  (optional) │  │            |processed|failed]    │
└──────────────────────────────────┘  │  uploadedAt     Date             │
                                      │  processedAt    Date             │
                                      │  pageCount      Number           │
                                      │  chunkCount     Number           │
                                      └──────────────────────────────────┘
```

---

## 📡 API Reference

### 🟢 Node.js Backend (Port 8000)

#### Conversations

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/conversations` | Get all conversations | — |
| `POST` | `/api/conversations` | Create new conversation | `{ title }` |
| `GET` | `/api/conversations/:id` | Get conversation + messages | — |
| `PATCH` | `/api/conversations/:id` | Update conversation title | `{ title }` |
| `DELETE` | `/api/conversations/:id` | Delete conversation + docs | — |
| `POST` | `/api/conversations/:id/messages` | Save a message | `{ role, content, chart_data?, citations?, suggestions? }` |

#### Documents

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/documents/upload` | Upload 1-10 PDFs | `multipart/form-data` files + `conversationId` |
| `GET` | `/api/documents/conversation/:id` | List docs for conversation | — |
| `DELETE` | `/api/documents/:documentId` | Delete document + vectors | — |
| `PATCH` | `/api/documents/:documentId/status` | Webhook: update processing status | `{ status, pageCount?, chunkCount? }` |

---

### 🟣 Python AI Service (Port 8001)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/health` | Health check | — |
| `POST` | `/process-document` | Trigger document ingestion into FAISS | `{ documentId, filePath, fileName, vectorNamespace }` |
| `POST` | `/query` | Ask question with RAG + chart generation | `{ question, chatHistory, vectorNamespaces, featureUsed }` |
| `POST` | `/delete-document` | Remove document vectors + file | `{ filePath, vectorNamespace }` |
| `POST` | `/delete-documents` | Batch delete documents | `[{ filePath, vectorNamespace }]` |
| `POST` | `/test-tools` | Test financial calculator tools | — |

#### Query Request Schema
```json
{
  "question": "Give me a bar chart of revenue",
  "chatHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ],
  "vectorNamespaces": ["doc-uuid-1", "doc-uuid-2"],
  "featureUsed": "Smart_Chart"
}
```

#### Query Response Schema
```json
{
  "answer": "Here is your Bar Chart based on the document.",
  "chart_data": {
    "type": "bar",
    "title": "Revenue By Month",
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [
      { "label": "Revenue", "data": [85000, 103000, 92000], "color": "#3b82f6" }
    ]
  },
  "citations": [{ "page": 2, "snippet": "...", "confidence": 0.95 }],
  "tool_calls": [],
  "suggestions": [
    "Show me a pie chart of expenses",
    "What is the profit margin?",
    "Compare revenue with last year"
  ]
}
```

---

## 📁 Project Structure

```
Financial-ChatBot/
├── Frontend/                         # React App (Vite)
│   └── src/
│       ├── components/
│       │   ├── chat/                 # ChatWindow, MessageBubble, SuggestionChips...
│       │   ├── charts/               # ChartCard (Recharts)
│       │   ├── export/               # ExportReports (PDF/Excel/Word)
│       │   ├── layout/               # Navbar, Sidebar, CustomCursor
│       │   ├── panels/               # CitationPanel, ToolCallsPanel
│       │   ├── ui/                   # FeatureModeBar, LanguageSelector...
│       │   └── voice/                # VoiceInputButton
│       ├── context/                  # ThemeContext, SettingsContext
│       ├── hooks/                    # useAutoScroll
│       ├── pages/                    # ChatPageNew, AboutPage, LandingPage
│       └── utils/                    # api.js (Axios client)
│
├── Backend/                          # Node.js (Express)
│   └── src/
│       ├── controllers/              # conversation, document, analytics
│       ├── models/                   # Conversation, Message, Document
│       ├── routes/                   # conversation.routes, document.routes
│       ├── middlewares/              # upload.middleware, error.middleware
│       ├── config/                   # db.js
│       └── utils/                   # helpers
│
├── Python-Backend/                   # FastAPI AI Service
│   └── app/
│       ├── api/                      # routes.py
│       ├── agent/                    # calculator.py, orchestrator.py
│       ├── config/                   # settings.py, prompts.py
│       ├── models/                   # schemas.py (Pydantic)
│       └── services/
│           ├── enhanced_rag_service.py  # Main RAG + chart pipeline
│           ├── document_processor.py   # PDF parsing + embedding
│           └── vector_store.py         # FAISS wrapper
│
├── .gitignore
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Backend + Frontend |
| Python | 3.9+ | AI Service |
| MongoDB | Atlas or Local | Database |
| Git | latest | Version control |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Fenil412/Financial-ChatBot.git
cd Financial-ChatBot
```

---

### Step 2 — Configure Environment Variables

Create `.env` files in each service directory using the provided examples:

#### Backend (`Backend/.env`)
```bash
cd Backend
cp .env.example .env
```

Edit `Backend/.env`:
```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/FinanceChatbotDB
PYTHON_SERVICE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

#### Python AI Service (`Python-Backend/.env`)
```bash
cd Python-Backend
cp .env.example .env
```

Edit `Python-Backend/.env`:
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
- Groq API: https://console.groq.com/keys (Free tier available)
- OpenRouter API: https://openrouter.ai/keys (Free tier available)

#### Frontend (`Frontend/.env`)
```bash
cd Frontend
cp .env.example .env
```

Edit `Frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_PYTHON_API_URL=http://localhost:5000
```

---

### Step 3 — Install Dependencies

#### Backend (Node.js)
```bash
cd Backend
npm install
```

#### Python AI Service
```bash
cd Python-Backend

# Option 1: Using virtual environment (Recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Option 2: Using Conda
conda create -n finchatbot python=3.9
conda activate finchatbot
pip install -r requirements.txt
```

#### Frontend (React)
```bash
cd Frontend
npm install
```

---

## 🏃 Running the Application

You need to run all three services simultaneously. Open **three separate terminal windows**:

### Terminal 1: Start Backend (Node.js)

```bash
cd Backend
npm start
```

**Expected output:**
```
✅ MongoDB Connected Successfully!
📍 Database Host: cluster.mongodb.net
📦 Database Name: FinanceChatbotDB
==================================================
🚀 FinChatBot Backend Server Started
==================================================
📍 Server URL: http://localhost:8000
🔌 Socket.IO: Enabled
🌐 CORS Origin: http://localhost:5173
📁 Uploads Directory: ./uploads
==================================================
```

---

### Terminal 2: Start Python AI Service

```bash
cd Python-Backend

# Activate your virtual environment first
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Start the service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# Alternative (if using venv):
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

**Expected output:**
```
[LLM] Initializing Groq llama-3.3-70b-versatile
[VISION] OpenRouter vision enabled: qwen/qwen2.5-vl-72b-instruct:free
============================================================
FinChatBot Python AI Service Starting...
============================================================
Vector Store Path: ./vector_store
LLM Model: llama-3.3-70b-versatile
Embedding Model: sentence-transformers/all-MiniLM-L6-v2
============================================================
Service ready to accept requests
============================================================
INFO:     Uvicorn running on http://0.0.0.0:5000
INFO:     Application startup complete.
```

---

### Terminal 3: Start Frontend (React)

```bash
cd Frontend
npm run dev
```

**Expected output:**
```
VITE v7.3.2  ready in 463 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

### Step 4 — Access the Application

Open your browser and navigate to:

**🌐 http://localhost:5173**

---

## 🎯 Quick Start Guide

1. **Create a Conversation**
   - Click "New Chat" button in the sidebar

2. **Upload Documents**
   - Click the 📎 paperclip icon in the input bar
   - Select one or more PDF files (max 10 files, 50MB each)
   - Wait for the amber "Processing..." banner to disappear

3. **Ask Questions**
   - Type your question in the input box
   - Examples:
     - "Give me a summary of the document"
     - "Show me a bar chart of revenue"
     - "What is the profit margin?"
     - "Compare Q1 and Q2 performance"

4. **Use Feature Modes**
   - Click the mode buttons at the top:
     - **General**: General conversation
     - **Document Analysis**: Deep document insights
     - **Smart Chart**: Automatic chart generation
     - **Insights**: Financial analysis

5. **Export Reports**
   - Click the "Export" button in the input bar
   - Choose format: PDF, Excel (.xlsx), or Word (.doc)

6. **Multi-language Support**
   - Click the language selector (EN/HI/GU)
   - Switch between English, Hindi, or Gujarati

---

## 🔧 Development Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
```

### Python AI Service
```bash
python -m uvicorn app.main:app --reload              # Development mode
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000  # Production mode
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 🧪 Testing the Setup

### 1. Test Backend Health
```bash
curl http://localhost:8000/api/health
```

### 2. Test Python AI Service
```bash
curl http://localhost:5000/health
```

### 3. Test Frontend
Open http://localhost:5173 in your browser

---

## 📦 Production Deployment

### Backend
```bash
cd Backend
npm install --production
NODE_ENV=production npm start
```

### Python AI Service
```bash
cd Python-Backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4
```

### Frontend
```bash
cd Frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Document Upload** | Upload up to 10 PDFs per conversation |
| 🤖 **RAG Q&A** | Context-aware answers from your documents |
| 📊 **Real Charts** | Bar, Line, Pie, Area charts via Recharts |
| 💡 **Suggestions** | 3 AI-generated follow-up questions after each answer |
| 🎛️ **Feature Modes** | General · Doc Analysis · Smart Chart · Insights |
| 🌐 **Multi-language** | English, Hindi (हिन्दी), Gujarati (ગુજરાતી) |
| 🎤 **Voice Input** | Dictate questions hands-free |
| 📥 **Export** | Download as PDF, Excel (.xlsx), or Word (.doc) |
| 🌙 **Dark Mode** | Full dark/light theme support |
| 🖱️ **Custom Cursor** | Premium custom cursor experience |

---

## 🌍 Environment Variables Summary

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| `MONGODB_URI` | Node.js | ✅ | MongoDB connection string |
| `GROQ_API_KEY` | Python | ✅ | Groq LLM API key |
| `OPENROUTER_API_KEY` | Python | ✅ | Vision model API key |
| `PYTHON_SERVICE_URL` | Node.js | ✅ | Python service URL |
| `NODE_BACKEND_URL` | Python | ✅ | Node.js backend URL |
| `VITE_API_URL` | Frontend | ✅ | Node.js backend URL |
| `VITE_PYTHON_SERVICE_URL` | Frontend | ✅ | Python AI URL |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|---------|
| MongoDB connection failed | Check `MONGODB_URI` in `Backend/.env` |
| Python module not found | Run `pip install -r requirements.txt` in venv |
| Chart shows text not visual | Restart Python backend after code changes |
| Documents stuck "processing" | Check Python backend logs for errors |
| CORS errors | Verify `FRONTEND_URL` in Backend `.env` |
| Voice input not working | Use HTTPS or localhost (browser requirement) |

---

## 📊 Performance

| Operation | Time |
|-----------|------|
| Document processing (per page) | 5-15s |
| Query response | 2-5s |
| Chart generation | +1-2s |
| Vector search | <100ms |
| Page load | <1s |

---

## 📄 License

ISC — See [LICENSE](./LICENSE)

---

## 👩‍💻 Author

**FinChatBot Team** — Built with ❤️ using React, FastAPI, LangChain & Groq
