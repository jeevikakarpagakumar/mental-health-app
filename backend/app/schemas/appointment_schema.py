from pydantic import BaseModel
from datetime import date as date_type


class AppointmentCreate(BaseModel):
    doctor_profile_id: int
    date: date_type
    time_slot: str  # "10:00 AM"
