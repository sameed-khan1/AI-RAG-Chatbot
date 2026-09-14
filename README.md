# AI RAG Chatbot

An AI-powered document question-answering system built with **FastAPI, React, ChromaDB, and Google Gemini**. The application allows users to upload documents, index their content, perform semantic retrieval, and ask questions using a grounded RAG pipeline.

## Features

* Upload PDF, DOCX, and TXT documents
* Automatic text extraction and processing
* Document chunking
* Vector embeddings and semantic search
* ChromaDB vector database
* Google Gemini-powered question answering
* Grounded responses based only on uploaded documents
* Hallucination guardrail for unavailable information
* Source references with document name and page number
* Document status tracking
* Document reprocessing
* Document deletion
* Knowledge dashboard with document and chunk statistics
* Chat history
* Responsive React frontend

## Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* ChromaDB
* Google Gemini API
* PyPDF
* python-docx

### Frontend

* React
* Vite
* Axios
* Lucide React
* CSS

## Project Structure

```text
AI-RAG-Chatbot/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   ├── dashboard.py
│   │   │   └── documents.py
│   │   │
│   │   ├── core/
│   │   │   └── config.py
│   │   │
│   │   ├── db/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   └── document.py
│   │   │
│   │   ├── services/
│   │   │   ├── chunking.py
│   │   │   ├── document_processor.py
│   │   │   ├── embedding.py
│   │   │   ├── llm.py
│   │   │   ├── processor.py
│   │   │   ├── retriever.py
│   │   │   └── vector_db.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── documents/
│   ├── Company_Overview.pdf
│   ├── FAQs.pdf
│   ├── Policies_and_Terms.pdf
│   ├── Property_Listings.pdf
│   └── Services_and_Fees.pdf
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

## RAG Workflow

```text
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Backend
 │
 ├── Document Upload
 │      │
 │      ▼
 │   Text Extraction
 │      │
 │      ▼
 │   Chunking
 │      │
 │      ▼
 │   Embeddings
 │      │
 │      ▼
 │   ChromaDB
 │
 └── User Question
        │
        ▼
   Query Embedding
        │
        ▼
   Semantic Retrieval
        │
        ▼
   Relevant Context
        │
        ▼
   Google Gemini
        │
        ▼
   Grounded Answer
        │
        ▼
   Sources
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/sameed-khan1/AI-RAG-Chatbot.git
cd AI-RAG-Chatbot
```

### 2. Backend Setup

Open a terminal in the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create:

```text
backend/.env
```

Add:

```env
API_KEY=your_gemini_api_key
MODEL_NAME=gemini-3.6-flash
```

Never commit your real API key to GitHub.

### 4. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Supported Documents

The system supports:

* PDF
* DOCX
* TXT

The included sample knowledge base contains fictional real-estate documents covering:

* Company information
* Property listings
* Services and fees
* Frequently asked questions
* Policies and terms

## API Endpoints

### Documents

| Method | Endpoint                    | Description                   |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/documents/upload`         | Upload and process a document |
| GET    | `/documents/`               | List documents                |
| DELETE | `/documents/{id}`           | Delete a document             |
| POST   | `/documents/{id}/reprocess` | Reprocess a document          |

### Chat

| Method | Endpoint | Description                         |
| ------ | -------- | ----------------------------------- |
| POST   | `/chat/` | Ask a question using the RAG system |

Example request:

```json
{
  "question": "What is the price of Green Valley Residence?"
}
```

### Dashboard

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| GET    | `/dashboard/stats` | Get knowledge-base statistics |

## Grounding and Hallucination Prevention

The chatbot is instructed to answer questions only from retrieved document context.

If the required information cannot be found, the system responds:

```text
I could not find this information in the uploaded documents.
```

This prevents the model from intentionally using outside knowledge or inventing information.

## Source References

Each generated answer can include references to the retrieved documents.

Example:

```text
Sources:
- FAQs.pdf — Page 2
- Property_Listings.pdf — Page 2
- Company_Overview.pdf — Page 2
```

## Sample Question

```text
What is the price of Green Valley Residence?
```

Expected grounded information:

```text
PKR 48,000,000
```

The response is generated using information retrieved from the uploaded real-estate documents.

## Testing

The system can be tested with questions covering:

1. Property prices
2. Property locations
3. Company services
4. Service fees
5. Required transaction documents
6. Cancellation and refund policies
7. Contact information
8. Office hours
9. Payment options
10. Questions about properties that do not exist in the knowledge base

The final test case verifies that the chatbot does not fabricate information when the requested property is not present in the uploaded documents.

## Security

Sensitive configuration is stored in environment variables.

The following files and directories are excluded from Git:

```text
.env
venv/
__pycache__/
uploads/
rag.db
node_modules/
dist/
```

## Future Improvements

* Persistent chat history
* User authentication
* Streaming AI responses
* Advanced document metadata filtering
* Improved retrieval ranking
* Multi-user knowledge bases
* Cloud deployment
* Automated evaluation metrics
* Conversation export

## License

This project was developed as part of the DevSynt internship evaluation project.
