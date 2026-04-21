from sqlalchemy import Column, Integer, ForeignKey, String, Date, DateTime
from datetime import datetime, timezone
from app.db.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))

    date = Column(Date)
    time_slot = Column(String)
    status = Column(String, default="booked")  # booked / completed / cancelled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
