from sqlalchemy import Column, Integer, ForeignKey, String, Boolean
from app.db.database import Base


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    name = Column(String)
    specialization = Column(String)
    experience = Column(Integer)
    qualification = Column(String)
    image_url = Column(String)

    is_approved = Column(Boolean, default=False)
