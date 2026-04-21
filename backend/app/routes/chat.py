from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.utils.dependencies import get_current_user
from app.services.user_service import get_or_create_user
from app.services.chat_service import generate_response

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
async def chat(
    request: ChatRequest,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    reply = await generate_response(db, user.id, request.message)
    return {"reply": reply}
