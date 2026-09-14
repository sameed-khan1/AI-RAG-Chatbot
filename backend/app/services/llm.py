from google import genai

from app.core.config import settings


client = genai.Client(api_key=settings.API_KEY)


def generate_answer(question, context):
    if not context:
        return {
            "answer": "I could not find this information in the uploaded documents.",
            "sources": []
        }

    context_text = ""

    for item in context:
        context_text += f"""
Document: {item["document_name"]}
Page: {item["page"]}
Content:
{item["text"]}

"""

    prompt = f"""
You are a document question-answering assistant.

Answer the user's question ONLY using the information provided
in the document context below.

Rules:
1. Do not use outside knowledge.
2. Do not invent or assume information.
3. If the answer cannot be found in the context, say:
"I could not find this information in the uploaded documents."
4. Give a clear and concise answer.

Document Context:
{context_text}

User Question:
{question}
"""

    try:
        interaction = client.interactions.create(
            model=settings.MODEL_NAME,
            input=prompt
        )

    except Exception as e:
        if "429" in str(e) or "quota" in str(e).lower():
            return {
                "answer": "The AI service quota has been reached. Please try again later.",
                "sources": []
            }

        raise e

    sources = []

    for item in context:
        source = {
            "document_name": item["document_name"],
            "page": item["page"]
        }

        if source not in sources:
            sources.append(source)

    return {
        "answer": interaction.output_text,
        "sources": sources
    }