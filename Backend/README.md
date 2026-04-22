# FinChatBot — Node.js Backend

REST API server for conversation management, document handling, and coordination between the frontend and Python AI service.

---

## 📋 Overview

- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Port**: `8000`

---

## 🚀 Quick Start

```bash
# Navigate to Backend directory
cd Backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI and other values
# PORT=8000
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/FinanceChatbotDB
# PYTHON_SERVICE_URL=http://localhost:5000
# FRONTEND_URL=http://localhost:5173

# Start the server
npm start

# Server will run at http://localhost:8000
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Python AI Service running

### Step-by-Step Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**

Create `.env` file:
```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/FinanceChatbotDB
PYTHON_SERVICE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

**MongoDB Setup:**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Get your connection string
- Replace `username`, `password`, and `cluster` in the URI

3. **Start the Server**
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

---

## 🏃 Running the Backend

### Production Mode
```bash
npm start
```

### Development Mode (with nodemon)
```bash
npm run dev
```

**Expected Output:**
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

## 🌐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | ✅ | `8000` | Server port |
| `MONGODB_URI` | ✅ | - | MongoDB connection string |
| `PYTHON_SERVICE_URL` | ✅ | `http://localhost:5000` | Python AI service URL |
| `FRONTEND_URL` | ✅ | `http://localhost:5173` | Frontend URL for CORS |

---

## API Endpoints

### Conversations — `/api/conversations`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Get all conversations |
| `POST` | `/` | Create new conversation |
| `GET` | `/:id` | Get conversation with all messages |
| `PATCH` | `/:id` | Update conversation title |
| `DELETE` | `/:id` | Delete conversation (also triggers document cleanup) |
| `POST` | `/:id/messages` | Save a user or assistant message |

**Create Conversation — Request:**
```json
{ "title": "Q4 Revenue Analysis" }
```

**Save Message — Request:**
```json
{
  "role": "assistant",
  "content": "Here is your bar chart...",
  "chart_data": { "type": "bar", "title": "Revenue", "labels": [], "datasets": [] },
  "citations": [],
  "suggestions": ["Show pie chart", "Compare with Q3", "What is the margin?"]
}
```

---

### Documents — `/api/documents`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload up to 10 PDFs (`multipart/form-data`) |
| `GET` | `/conversation/:id` | Get all documents for a conversation |
| `DELETE` | `/:documentId` | Delete document (file + vectors) |
| `PATCH` | `/:documentId/status` | Webhook: Python updates document status |

**Upload Request:**
```
Content-Type: multipart/form-data
Fields: documents[] (files), conversationId (string)
```

**Status Update (Webhook from Python):**
```json
{
  "status": "processed",
  "pageCount": 4,
  "chunkCount": 32
}
```

---

## Project Structure

```
Backend/
├── src/
│   ├── app.js                    # Express setup + middleware
│   ├── server.js                 # Server entry + Socket.IO
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── conversation.controller.js
│   │   ├── document.controller.js
│   │   └── analytics.controller.js
│   ├── models/
│   │   ├── Conversation.model.js
│   │   ├── Message.model.js
│   │   └── Document.model.js
│   ├── routes/
│   │   ├── conversation.routes.js
│   │   └── document.routes.js
│   ├── middlewares/
│   │   ├── upload.middleware.js   # Multer config
│   │   └── error.middleware.js
│   └── utils/
│       └── helpers.js
├── uploads/                      # Uploaded files (gitignored)
└── package.json
```

---

## MongoDB Models

### Conversation
```js
{ title: String, status: String, createdAt: Date }
```

### Message
```js
{
  conversationId: ObjectId,
  role: 'user' | 'assistant' | 'system',
  content: String,
  chart_data: Object,
  citations: Array,
  suggestions: Array,
  timestamp: Date
}
```

### Document
```js
{
  conversationId: ObjectId,
  fileName: String,
  filePath: String,
  vectorNamespace: String,
  status: 'pending' | 'processing' | 'processed' | 'failed',
  pageCount: Number,
  chunkCount: Number
}
```

---

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `document:processing` | Server → Client | `{ documentId }` |
| `document:completed` | Server → Client | `{ documentId, status }` |
| `document:error` | Server → Client | `{ documentId, error }` |
