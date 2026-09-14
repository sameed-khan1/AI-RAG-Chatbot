from fastapi import APIRouter
from app.db.database import SessionLocal, Document

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats():
    db = SessionLocal()

    total_documents = db.query(Document).count()
    processed_documents = db.query(Document).filter(
        Document.status == "processed"
    ).count()
    processing_documents = db.query(Document).filter(
        Document.status == "processing"
    ).count()
    failed_documents = db.query(Document).filter(
        Document.status == "failed"
    ).count()

    documents = db.query(Document).all()

    total_chunks = sum(
        document.chunk_count or 0
        for document in documents
    )

    db.close()

    return {
        "total_documents": total_documents,
        "processed_documents": processed_documents,
        "processing_documents": processing_documents,
        "failed_documents": failed_documents,
        "total_chunks": total_chunks
    }