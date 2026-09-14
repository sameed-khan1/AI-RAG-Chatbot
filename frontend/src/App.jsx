import { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Upload,
  Trash2,
  RefreshCw,
  Send,
  Bot,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  History
} from "lucide-react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [activeView, setActiveView] = useState("dashboard");

  const [documents, setDocuments] = useState([]);

  const [stats, setStats] = useState({
    total_documents: 0,
    processed_documents: 0,
    processing_documents: 0,
    failed_documents: 0,
    total_chunks: 0
  });

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 3 loading states
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [reprocessing, setReprocessing] = useState(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [docsResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/documents/`),
        axios.get(`${API}/dashboard/stats`)
      ]);

      setDocuments(docsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the backend.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setChatHistory((previous) => [newChat, ...previous]);
    setActiveChat(newChat.id);
    setActiveView("chat");
  };

  const selectChat = (id) => {
    setActiveChat(id);
    setActiveView("chat");
  };

  const uploadDocument = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API}/documents/upload`, formData);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Document upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }

    event.target.value = "";
  };

  const deleteDocument = async (id) => {
    if (!confirm("Delete this document?")) return;

    setError("");
    setDeleting(id);

    try {
      await axios.delete(`${API}/documents/${id}`);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Delete failed. Please try again."
      );
    } finally {
      setDeleting(null);
    }
  };

  const reprocessDocument = async (id) => {
    setError("");
    setReprocessing(id);

    try {
      await axios.post(`${API}/documents/${id}/reprocess`);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Reprocessing failed. Please try again."
      );
    } finally {
      setReprocessing(null);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    let currentChat = chatHistory.find(
      (chat) => chat.id === activeChat
    );

    if (!currentChat) {
      const newChat = {
        id: Date.now(),
        title: question.trim().slice(0, 35),
        messages: [],
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setChatHistory((previous) => [
        newChat,
        ...previous
      ]);

      setActiveChat(newChat.id);

      currentChat = newChat;
    }

    const currentQuestion = question.trim();

    const userMessage = {
      role: "user",
      text: currentQuestion,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setChatHistory((previous) =>
      previous.map((chat) =>
        chat.id === currentChat.id
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? currentQuestion.slice(0, 35)
                  : chat.title,
              messages: [
                ...chat.messages,
                userMessage
              ]
            }
          : chat
      )
    );

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/chat/`, {
        question: currentQuestion
      });

      const assistantMessage = {
        role: "assistant",
        text: response.data.answer,
        sources: response.data.sources || [],
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setChatHistory((previous) =>
        previous.map((chat) =>
          chat.id === currentChat.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  assistantMessage
                ]
              }
            : chat
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to get an answer from the AI."
      );

      setChatHistory((previous) =>
        previous.map((chat) =>
          chat.id === currentChat.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant",
                    text:
                      "Sorry, I couldn't process your question.",
                    sources: [],
                    time: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  }
                ]
              }
            : chat
        )
      );
    }

    setLoading(false);
  };

  const currentChat = chatHistory.find(
    (chat) => chat.id === activeChat
  );

  const currentMessages =
    currentChat?.messages || [];

  const renderDocuments = () => (
    <div className="page-container">
      <div className="page-header">
        <h1>Documents</h1>
        <p>Manage your indexed knowledge base.</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Document Management</h2>
          <p>Upload, reprocess, or remove documents.</p>
        </div>

        <div className="upload-box">
          <Upload size={32} />

          <h3>Upload a document</h3>

          <p>
            Supported formats: PDF, DOCX, TXT
          </p>

          <label
            className={`upload-button ${
              uploading ? "disabled" : ""
            }`}
          >
            <Upload size={16} />
            {uploading
              ? "Uploading..."
              : "Upload Document"}

            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={uploadDocument}
              hidden
              disabled={uploading}
            />
          </label>
        </div>

        <div className="documents-list">
          {documents.length === 0 ? (
            <div className="empty-state">
              <FileText size={35} />

              <h3>No documents uploaded yet</h3>

              <p>
                Upload a document to build your
                knowledge base.
              </p>
            </div>
          ) : (
            documents.map((document) => (
              <div
                className="document-row"
                key={document.id}
              >
                <div className="document-info">
                  <div className="document-icon">
                    <FileText size={20} />
                  </div>

                  <div>
                    <p className="document-name">
                      {document.name}
                    </p>

                    <div className="document-meta">
                      {document.chunk_count || 0} chunks
                    </div>
                  </div>
                </div>

                <span
                  className={`status ${document.status}`}
                >
                  {document.status === "processed" && (
                    <CheckCircle size={12} />
                  )}

                  {document.status === "processing" && (
                    <Clock size={12} />
                  )}

                  {document.status === "failed" && (
                    <AlertCircle size={12} />
                  )}

                  {document.status}
                </span>

                <div className="document-actions">
                  <button
                    className="icon-button"
                    onClick={() =>
                      reprocessDocument(document.id)
                    }
                    disabled={
                      reprocessing === document.id
                    }
                    title="Reprocess"
                  >
                    <RefreshCw
                      size={15}
                      className={
                        reprocessing === document.id
                          ? "spinning"
                          : ""
                      }
                    />
                  </button>

                  <button
                    className="icon-button delete"
                    onClick={() =>
                      deleteDocument(document.id)
                    }
                    disabled={
                      deleting === document.id
                    }
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Knowledge Dashboard</h1>

        <p>
          Manage your documents and ask questions using RAG.
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={21} />
          </div>

          <div className="stat-info">
            <h2>{stats.total_documents}</h2>
            <p>Total Documents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={21} />
          </div>

          <div className="stat-info">
            <h2>{stats.processed_documents}</h2>
            <p>Processed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={21} />
          </div>

          <div className="stat-info">
            <h2>{stats.processing_documents}</h2>
            <p>Processing</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={21} />
          </div>

          <div className="stat-info">
            <h2>{stats.total_chunks}</h2>
            <p>Indexed Chunks</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Recent Documents</h2>
            <p>Your indexed knowledge base.</p>
          </div>

          <div className="documents-list">
            {documents.length === 0 ? (
              <div className="empty-state">
                <FileText size={35} />

                <h3>No documents uploaded yet</h3>

                <p>
                  Upload documents to start building
                  your knowledge base.
                </p>
              </div>
            ) : (
              documents.slice(0, 5).map((document) => (
                <div
                  className="document-row"
                  key={document.id}
                >
                  <div className="document-info">
                    <div className="document-icon">
                      <FileText size={19} />
                    </div>

                    <div>
                      <p className="document-name">
                        {document.name}
                      </p>

                      <div className="document-meta">
                        {document.chunk_count || 0} chunks
                      </div>
                    </div>
                  </div>

                  <span
                    className={`status ${document.status}`}
                  >
                    {document.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Upload Documents</h2>
            <p>
              Add new files to your AI knowledge base.
            </p>
          </div>

          <div className="upload-box">
            <Upload size={32} />

            <h3>Upload a document</h3>

            <p>
              PDF, DOCX and TXT files are supported.
            </p>

            <label
              className={`upload-button ${
                uploading ? "disabled" : ""
              }`}
            >
              <Upload size={16} />
              {uploading
                ? "Uploading..."
                : "Choose File"}

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={uploadDocument}
                hidden
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="page-container">
      <div className="page-header chat-page-header">
        <div>
          <h1>AI Assistant</h1>
          <p>
            Ask questions about your uploaded documents.
          </p>
        </div>

        <button
          className="upload-button"
          onClick={createNewChat}
        >
          <Plus size={17} />
          New Chat
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="chat-layout">
        <div className="chat-history">
          <div className="chat-history-header">
            <History size={17} />
            <span>Chat History</span>
          </div>

          {chatHistory.length === 0 ? (
            <div className="history-empty">
              No conversations yet.
            </div>
          ) : (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                className={`history-item ${
                  chat.id === activeChat
                    ? "active"
                    : ""
                }`}
                onClick={() => selectChat(chat.id)}
              >
                <MessageSquare size={15} />

                <div>
                  <strong>
                    {chat.title}
                  </strong>

                  <small>
                    {chat.createdAt}
                  </small>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="chat-card">
          <div className="chat-messages">
            {currentMessages.length === 0 && (
              <div className="empty-state">
                <Bot size={40} />

                <h3>Ask your knowledge base</h3>

                <p>
                  Ask anything about your uploaded
                  documents.
                </p>
              </div>
            )}

            {currentMessages.map(
              (message, index) => (
                <div
                  className={`message ${message.role}`}
                  key={index}
                >
                  <div className="message-avatar">
                    {message.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>

                  <div className="message-content">
                    <div className="message-bubble">
                      {message.text}
                    </div>

                    <small className="message-time">
                      {message.time}
                    </small>

                    {message.sources &&
                      message.sources.length > 0 && (
                        <div className="sources">
                          <div className="sources-title">
                            Sources
                          </div>

                          {message.sources.map(
                            (
                              source,
                              sourceIndex
                            ) => (
                              <span
                                className="source-item"
                                key={sourceIndex}
                              >
                                <FileText size={11} />

                                {source.document_name}

                                {source.page
                                  ? ` — Page ${source.page}`
                                  : ""}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>

                <div className="message-content">
                  <div className="message-bubble">
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  askQuestion();
                }
              }}
              placeholder="Ask a question..."
              disabled={loading}
            />

            <button
              className="send-button"
              onClick={askQuestion}
              disabled={loading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <Bot size={21} />
          </div>

          <span>AI RAG ChatBot</span>
        </div>

        <nav className="nav">
          <button
            className={`nav-button ${
              activeView === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveView("dashboard")
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-button ${
              activeView === "documents"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveView("documents")
            }
          >
            <FileText size={18} />
            <span>Documents</span>
          </button>

          <button
            className={`nav-button ${
              activeView === "chat"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveView("chat")
            }
          >
            <MessageSquare size={18} />
            <span>Chat</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {activeView === "dashboard" &&
          renderDashboard()}

        {activeView === "documents" &&
          renderDocuments()}

        {activeView === "chat" &&
          renderChat()}
      </main>
    </div>
  );
}

export default App;