import uuid

from app.services.document_processor import extract_text
from app.services.chunking import chunk_text
from app.services.embedding import create_embeddings
from app.services.vector_db import add_chunks
from app.models.document import DocumentChunk


def process_document(file_path, document_id, document_name):
    pages = extract_text(file_path)

    chunks = []

    for page_data in pages:
        page = page_data["page"]
        text = page_data["text"]

        if not text:
            continue

        text_chunks = chunk_text(text)

        for chunk_text_value in text_chunks:
            chunks.append(
                DocumentChunk(
                    document_id=document_id,
                    document_name=document_name,
                    chunk_id=str(uuid.uuid4()),
                    text=chunk_text_value,
                    page=page
                )
            )

    if not chunks:
        raise ValueError("No text could be extracted from document")

    texts = [chunk.text for chunk in chunks]

    embeddings = create_embeddings(texts)

    add_chunks(chunks, embeddings)

    return {
        "document_id": document_id,
        "document_name": document_name,
        "chunks": len(chunks)
    }