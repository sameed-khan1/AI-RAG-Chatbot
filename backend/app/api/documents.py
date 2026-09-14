from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid

from app.services.processor import process_document
from app.db.database import SessionLocal, Document


router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported"
        )

    document_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{document_id}{extension}"

    db = SessionLocal()

    document = Document(
        id=document_id,
        name=file.filename,
        file_path=str(file_path),
        file_type=extension,
        status="processing",
        chunk_count=0
    )

    db.add(document)
    db.commit()

    try:
        content = await file.read()
        file_path.write_bytes(content)

        result = process_document(
            file_path=str(file_path),
            document_id=document_id,
            document_name=file.filename
        )

        document.status = "processed"
        document.chunk_count = result["chunks"]

        db.commit()

        return {
            "success": True,
            "message": "Document processed successfully",
            "document_id": document_id,
            "document_name": file.filename,
            "chunks": result["chunks"]
        }

    except Exception as e:
        document.status = "failed"
        db.commit()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()

@router.get("/")
def list_documents():
    db = SessionLocal()

    documents = db.query(Document).order_by(
        Document.created_at.desc()
    ).all()

    result = []

    for document in documents:
        result.append({
            "id": document.id,
            "name": document.name,
            "file_type": document.file_type,
            "status": document.status,
            "chunk_count": document.chunk_count,
            "created_at": document.created_at
        })

    db.close()

    return result

from app.services.vector_db import collection
@router.delete("/{document_id}")
def delete_document(document_id: str):
    db = SessionLocal()

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    collection.delete(
        where={"document_id": document_id}
    )

    file_path = Path(document.file_path)

    if file_path.exists():
        file_path.unlink()

    db.delete(document)
    db.commit()
    db.close()

    return {
        "success": True,
        "message": "Document deleted successfully"
    }

@router.post("/{document_id}/reprocess")
def reprocess_document(document_id: str):
    db = SessionLocal()

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    try:
        document.status = "processing"
        db.commit()

        collection.delete(
            where={"document_id": document_id}
        )

        result = process_document(
            file_path=document.file_path,
            document_id=document.id,
            document_name=document.name
        )

        document.status = "processed"
        document.chunk_count = result["chunks"]

        db.commit()

        return {
            "success": True,
            "message": "Document reprocessed successfully",
            "document_id": document.id,
            "chunks": result["chunks"]
        }

    except Exception as e:
        document.status = "failed"
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()