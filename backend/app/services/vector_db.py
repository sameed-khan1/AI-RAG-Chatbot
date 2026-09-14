import chromadb


client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="documents"
)


def add_chunks(chunks, embeddings):
    ids = [chunk.chunk_id for chunk in chunks]

    documents = [chunk.text for chunk in chunks]

    metadatas = [
        {
            "document_id": chunk.document_id,
            "document_name": chunk.document_name,
            "page": chunk.page if chunk.page is not None else 0
        }
        for chunk in chunks
    ]

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )


def search_chunks(query_embedding, top_k=5):
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results