from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.schemas.mood_schema import MoodCreate
from app.models.mood import Mood
from app.utils.dependencies import get_current_user
from app.services.user_service import get_or_create_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_mood(
    mood: MoodCreate,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    new_mood = Mood(user_id=user.id, mood_score=mood.mood_score, emotions=mood.emotions)
    db.add(new_mood)
    db.commit()
    db.refresh(new_mood)
    return {"message": "Mood logged successfully", "id": new_mood.id}


@router.get("/")
def list_moods(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    moods = (
        db.query(Mood)
        .filter(Mood.user_id == user.id)
        .order_by(Mood.created_at.desc())
        .all()
    )
    return [
        {
            "id": m.id,
            "mood_score": m.mood_score,
            "emotions": m.emotions,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in moods
    ]
