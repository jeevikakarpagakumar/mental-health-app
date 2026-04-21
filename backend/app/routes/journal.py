from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal

from app.schemas.journal_schema import JournalCreate
from app.models.journal import Journal
from app.utils.dependencies import get_current_user
from app.services.user_service import get_or_create_user
from app.services.ai_service import analyze_emotion

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
async def create_journal(
    journal: JournalCreate,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    result = await analyze_emotion(journal.text)

    new_entry = Journal(
        user_id=user.id,
        text=journal.text,
        emotion=result["emotion"],
        confidence=result["confidence"],
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {
        "message": "Journal saved",
        "ai_analysis": result,
        "id": new_entry.id,
    }


@router.get("/")
def list_journals(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    journals = (
        db.query(Journal)
        .filter(Journal.user_id == user.id)
        .order_by(Journal.created_at.desc())
        .all()
    )
    return [
        {
            "id": j.id,
            "text": j.text,
            "emotion": j.emotion,
            "confidence": j.confidence,
            "created_at": j.created_at.isoformat() if j.created_at else None,
        }
        for j in journals
    ]
