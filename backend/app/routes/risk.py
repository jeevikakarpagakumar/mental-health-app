from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal

from app.utils.dependencies import get_current_user
from app.services.user_service import get_or_create_user
from app.services.risk_service import detect_risk

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def risk(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    return detect_risk(db, user.id)
