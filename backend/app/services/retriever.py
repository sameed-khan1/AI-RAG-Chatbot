from app.services.embedding import create_embeddings
from app.services.vector_db import search_chunks


def retrieve_context(question, top_k=5):
    question_embedding = create_embeddings([question])[0]

    results = search_chunks(
        query_embedding=question_embedding,
        top_k=top_k
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    context = []

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):
        context.append({
            "text": document,
            "document_name": metadata.get("document_name"),
            "document_id": metadata.get("document_id"),
            "page": metadata.get("page"),
            "distance": distance
        })

    return context