from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.utils.dependencies import get_current_user
from app.services.user_service import get_or_create_user
from app.schemas.appointment_schema import AppointmentCreate
from app.services.appointment_service import book_appointment
from app.models.appointment import Appointment
from app.models.user import User
from app.models.doctor_profile import DoctorProfile

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_appointment(
    data: AppointmentCreate,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    appointment = book_appointment(db, user.id, data)
    return {
        "message": "Appointment booked",
        "appointment_id": appointment.id,
    }


def _enrich(appointments, db):
    result = []
    for a in appointments:
        doctor_user = db.query(User).filter(User.id == a.doctor_id).first()
        patient_user = db.query(User).filter(User.id == a.patient_id).first()
        doctor_profile = (
            db.query(DoctorProfile)
            .filter(DoctorProfile.user_id == a.doctor_id)
            .first()
        )
        result.append(
            {
                "id": a.id,
                "date": a.date.isoformat() if a.date else None,
                "time_slot": a.time_slot,
                "status": a.status,
                "doctor_name": doctor_profile.name if doctor_profile else (doctor_user.email if doctor_user else None),
                "doctor_specialization": doctor_profile.specialization if doctor_profile else None,
                "doctor_image_url": doctor_profile.image_url if doctor_profile else None,
                "patient_email": patient_user.email if patient_user else None,
                "patient_name": patient_user.name if patient_user else None,
            }
        )
    return result


@router.get("/patient")
def get_patient_appointments(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == user.id)
        .order_by(Appointment.date.desc())
        .all()
    )
    return _enrich(appointments, db)


@router.get("/doctor")
def get_doctor_appointments(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_or_create_user(db, firebase_user)
    appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == user.id)
        .order_by(Appointment.date.desc())
        .all()
    )
    return _enrich(appointments, db)


@router.get("/slots/{doctor_profile_id}")
def get_available_slots(
    doctor_profile_id: int,
    date: str,
    db: Session = Depends(get_db),
):
    doctor = (
        db.query(DoctorProfile).filter(DoctorProfile.id == doctor_profile_id).first()
    )
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    all_slots = [
        "09:00 AM", "10:00 AM", "11:00 AM",
        "02:00 PM", "03:00 PM", "04:00 PM",
    ]

    booked = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doctor.user_id, Appointment.date == date)
        .all()
    )
    booked_slots = [b.time_slot for b in booked]
    available = [s for s in all_slots if s not in booked_slots]

    return {"available_slots": available, "all_slots": all_slots}
