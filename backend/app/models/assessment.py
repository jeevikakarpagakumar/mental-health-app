from sqlalchemy import Column, Integer, ForeignKey, JSON, String, DateTime
from datetime import datetime, timezone
from app.db.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    type = Column(String)  # PHQ9 / GAD7
    answers = Column(JSON)
    score = Column(Integer)
    severity = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
