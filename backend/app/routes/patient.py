from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.utils.dependencies import get_current_user
from app.models.patient_profile import PatientProfile
from app.models.user import User
from app.schemas.patient_schema import PatientProfileCreate
from app.services.user_service import get_or_create_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/profile")
def create_patient_profile(
    data: PatientProfileCreate,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)

    existing = (
        db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
    )
    if existing:
        existing.age = data.age
        existing.gender = data.gender
        existing.medical_history = data.medical_history
    else:
        profile = PatientProfile(
            user_id=user.id,
            age=data.age,
            gender=data.gender,
            medical_history=data.medical_history,
        )
        db.add(profile)

    db.commit()
    return {"message": "Patient profile saved"}


@router.get("/profile")
def get_patient_profile(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    profile = (
        db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
    )
    if not profile:
        return None
    return {
        "age": profile.age,
        "gender": profile.gender,
        "medical_history": profile.medical_history,
    }
