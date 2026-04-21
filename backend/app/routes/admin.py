from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.doctor_profile import DoctorProfile
from app.models.appointment import Appointment
from app.services.risk_service import detect_risk
from app.services import notification_service
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_admin(firebase_user, db):
    user = db.query(User).filter(User.firebase_uid == firebase_user["uid"]).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/doctors/pending")
def get_pending_doctors(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    doctors = db.query(DoctorProfile).filter(DoctorProfile.is_approved == False).all()
    return [
        {
            "id": d.id,
            "user_id": d.user_id,
            "name": d.name,
            "specialization": d.specialization,
            "experience": d.experience,
            "qualification": d.qualification,
            "image_url": d.image_url,
            "is_approved": d.is_approved,
        }
        for d in doctors
    ]


@router.get("/doctors")
def get_all_doctors(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    doctors = db.query(DoctorProfile).all()
    return [
        {
            "id": d.id,
            "user_id": d.user_id,
            "name": d.name,
            "specialization": d.specialization,
            "experience": d.experience,
            "qualification": d.qualification,
            "image_url": d.image_url,
            "is_approved": d.is_approved,
        }
        for d in doctors
    ]


@router.post("/doctors/{doctor_id}/approve")
def approve_doctor(
    doctor_id: int,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    doctor = db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.is_approved = True
    db.commit()

    owner = db.query(User).filter(User.id == doctor.user_id).first()
    if owner:
        notification_service.send_doctor_approved(owner.email, doctor.name)

    return {"message": "Doctor approved successfully"}


@router.delete("/doctors/{doctor_id}")
def reject_doctor(
    doctor_id: int,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    doctor = db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    owner = db.query(User).filter(User.id == doctor.user_id).first()
    name_copy = doctor.name
    db.delete(doctor)
    db.commit()

    if owner:
        notification_service.send_doctor_rejected(owner.email, name_copy)

    return {"message": "Doctor rejected and removed"}


@router.get("/users")
def list_users(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    users = db.query(User).all()
    return [
        {"id": u.id, "email": u.email, "name": u.name, "role": u.role} for u in users
    ]


@router.get("/stats")
def system_stats(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    total_users = db.query(User).count()
    total_patients = db.query(User).filter(User.role == "patient").count()
    total_doctors = db.query(User).filter(User.role == "doctor").count()
    pending_doctors = (
        db.query(DoctorProfile).filter(DoctorProfile.is_approved == False).count()
    )
    approved_doctors = (
        db.query(DoctorProfile).filter(DoctorProfile.is_approved == True).count()
    )
    total_appointments = db.query(Appointment).count()

    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "pending_doctors": pending_doctors,
        "approved_doctors": approved_doctors,
        "total_appointments": total_appointments,
    }


@router.get("/high-risk")
def high_risk_users(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    patients = db.query(User).filter(User.role == "patient").all()
    result = []
    for p in patients:
        risk = detect_risk(db, p.id)
        if risk["risk_level"] in ("medium", "high"):
            result.append(
                {
                    "id": p.id,
                    "email": p.email,
                    "name": p.name,
                    "risk_level": risk["risk_level"],
                    "warnings": risk["warnings"],
                }
            )
    # Sort high first
    result.sort(key=lambda x: 0 if x["risk_level"] == "high" else 1)
    return result


class AppointmentUpdate(BaseModel):
    date: Optional[str] = None  # ISO yyyy-mm-dd
    time_slot: Optional[str] = None
    status: Optional[str] = None  # booked / cancelled / completed


@router.get("/appointments")
def list_all_appointments(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    appts = db.query(Appointment).order_by(Appointment.date.desc()).all()
    result = []
    for a in appts:
        doctor_user = db.query(User).filter(User.id == a.doctor_id).first()
        patient_user = db.query(User).filter(User.id == a.patient_id).first()
        doctor_profile = (
            db.query(DoctorProfile).filter(DoctorProfile.user_id == a.doctor_id).first()
        )
        result.append(
            {
                "id": a.id,
                "date": a.date.isoformat() if a.date else None,
                "time_slot": a.time_slot,
                "status": a.status,
                "doctor_name": doctor_profile.name if doctor_profile else (doctor_user.email if doctor_user else None),
                "doctor_email": doctor_user.email if doctor_user else None,
                "patient_email": patient_user.email if patient_user else None,
                "patient_name": patient_user.name if patient_user else None,
            }
        )
    return result


@router.patch("/appointments/{appointment_id}")
def update_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    from datetime import date as date_type
    if data.date:
        appt.date = date_type.fromisoformat(data.date)
    if data.time_slot:
        appt.time_slot = data.time_slot
    if data.status:
        if data.status not in {"booked", "cancelled", "completed"}:
            raise HTTPException(status_code=400, detail="Invalid status")
        appt.status = data.status

    db.commit()
    db.refresh(appt)

    # Notify on cancellation
    if data.status == "cancelled":
        patient_user = db.query(User).filter(User.id == appt.patient_id).first()
        doctor_user = db.query(User).filter(User.id == appt.doctor_id).first()
        if patient_user and doctor_user:
            notification_service.send_appointment_cancelled(
                patient_user.email, doctor_user.email,
                appt.date.isoformat() if appt.date else "", appt.time_slot or "",
            )

    return {
        "id": appt.id,
        "date": appt.date.isoformat() if appt.date else None,
        "time_slot": appt.time_slot,
        "status": appt.status,
    }


@router.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_admin(firebase_user, db)
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt)
    db.commit()
    return {"message": "Appointment removed"}
