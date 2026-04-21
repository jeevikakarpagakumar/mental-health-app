from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.schemas.user_schema import SetRole, UserOut
from app.services.user_service import get_or_create_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/me")
def get_me(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)

    # Check doctor approval status if applicable
    doctor_profile = None
    if user.role == "doctor":
        from app.models.doctor_profile import DoctorProfile
        dp = db.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
        if dp:
            doctor_profile = {
                "id": dp.id,
                "name": dp.name,
                "specialization": dp.specialization,
                "experience": dp.experience,
                "qualification": dp.qualification,
                "image_url": dp.image_url,
                "is_approved": dp.is_approved,
            }

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "doctor_profile": doctor_profile,
    }


@router.post("/set-role")
def set_role(
    data: SetRole,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.firebase_uid == firebase_user["uid"]).first()

    if not user:
        user = User(
            firebase_uid=firebase_user["uid"],
            email=firebase_user.get("email"),
            name=data.name or firebase_user.get("name"),
            role=data.role,
        )
        db.add(user)
    else:
        user.role = data.role
        if data.name:
            user.name = data.name

    db.commit()
    db.refresh(user)

    return {
        "message": f"Role set to {data.role}",
        "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name},
    }
