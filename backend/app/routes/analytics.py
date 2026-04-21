from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal

from app.utils.dependencies import get_current_user
from app.services.user_service import get_or_create_user
from app.services.analytics_service import get_analytics

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def analytics(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    return get_analytics(db, user.id)
