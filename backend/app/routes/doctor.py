from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.utils.dependencies import get_current_user
from app.models.doctor_profile import DoctorProfile
from app.models.user import User
from app.schemas.doctor_schema import DoctorRegister
from app.services.user_service import get_or_create_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register_doctor(
    data: DoctorRegister,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    user.role = "doctor"

    existing = (
        db.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
    )
    if existing:
        existing.name = data.name
        existing.specialization = data.specialization
        existing.experience = data.experience
        existing.qualification = data.qualification
        existing.image_url = data.image_url
    else:
        profile = DoctorProfile(
            user_id=user.id,
            name=data.name,
            specialization=data.specialization,
            experience=data.experience,
            qualification=data.qualification,
            image_url=data.image_url,
            is_approved=False,
        )
        db.add(profile)

    db.commit()
    return {"message": "Doctor registered. Awaiting admin approval"}


@router.get("/me")
def my_doctor_profile(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    profile = (
        db.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
    )
    if not profile:
        return None
    return {
        "id": profile.id,
        "name": profile.name,
        "specialization": profile.specialization,
        "experience": profile.experience,
        "qualification": profile.qualification,
        "image_url": profile.image_url,
        "is_approved": profile.is_approved,
    }


@router.get("/list")
def list_approved_doctors(db: Session = Depends(get_db)):
    doctors = (
        db.query(DoctorProfile).filter(DoctorProfile.is_approved == True).all()
    )
    return [
        {
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization,
            "experience": d.experience,
            "qualification": d.qualification,
            "image_url": d.image_url,
        }
        for d in doctors
    ]



@router.get("/patients")
def my_patients(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Patients who have booked this doctor, with current risk context."""
    from app.models.appointment import Appointment
    from app.services.risk_service import detect_risk

    user = get_or_create_user(db, firebase_user)
    if user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")

    appts = db.query(Appointment).filter(Appointment.doctor_id == user.id).all()
    patient_ids = list({a.patient_id for a in appts})

    result = []
    for pid in patient_ids:
        patient = db.query(User).filter(User.id == pid).first()
        if not patient:
            continue
        patient_appts = [a for a in appts if a.patient_id == pid]
        latest = sorted(patient_appts, key=lambda a: a.date or "", reverse=True)[0]
        risk = detect_risk(db, pid)
        result.append({
            "id": pid,
            "email": patient.email,
            "name": patient.name,
            "risk_level": risk["risk_level"],
            "warnings": risk["warnings"],
            "total_appointments": len(patient_appts),
            "latest_appointment": {
                "date": latest.date.isoformat() if latest.date else None,
                "time_slot": latest.time_slot,
                "status": latest.status,
            },
        })

    # Sort high-risk first
    order = {"high": 0, "medium": 1, "low": 2}
    result.sort(key=lambda x: order.get(x["risk_level"], 3))
    return result
