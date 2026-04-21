from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal

from app.schemas.assessment_schema import AssessmentCreate
from app.models.assessment import Assessment
from app.utils.dependencies import get_current_user
from app.services.user_service import get_or_create_user
from app.services.assessment_service import calculate_score, get_recommendations

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def submit_assessment(
    data: AssessmentCreate,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    score, severity = calculate_score(data.type, data.answers)
    recommendations = get_recommendations(severity)

    record = Assessment(
        user_id=user.id,
        type=data.type,
        answers=data.answers,
        score=score,
        severity=severity,
    )
    db.add(record)
    db.commit()

    return {
        "score": score,
        "severity": severity,
        "recommendations": recommendations,
    }


@router.get("/")
def list_assessments(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    records = (
        db.query(Assessment)
        .filter(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "type": r.type,
            "score": r.score,
            "severity": r.severity,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
