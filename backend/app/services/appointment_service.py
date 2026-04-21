from app.models.appointment import Appointment
from app.models.doctor_profile import DoctorProfile
from fastapi import HTTPException


def book_appointment(db, patient_id, data):
    doctor = (
        db.query(DoctorProfile)
        .filter(DoctorProfile.id == data.doctor_profile_id)
        .first()
    )

    if not doctor or not doctor.is_approved:
        raise HTTPException(status_code=400, detail="Doctor not available")

    existing = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor.user_id,
            Appointment.date == data.date,
            Appointment.time_slot == data.time_slot,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")

    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=doctor.user_id,
        date=data.date,
        time_slot=data.time_slot,
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment
