from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.retriever import retrieve_context
from app.services.llm import generate_answer


router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    question: str


@router.post("/")
def chat(request: ChatRequest):
    try:
        print("QUESTION:", request.question)

        print("STEP 1: Retrieving context...")
        context = retrieve_context(request.question)
        print("CONTEXT:", context)

        print("STEP 2: Generating answer...")
        result = generate_answer(
            question=request.question,
            context=context
        )
        print("RESULT:", result)

        return result

    except Exception as e:
        print("CHAT ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )