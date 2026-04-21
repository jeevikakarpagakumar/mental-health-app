from sqlalchemy import Column, Integer, ForeignKey, Text, Float, String, DateTime
from datetime import datetime, timezone
from app.db.database import Base


class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    text = Column(Text)
    emotion = Column(String)
    confidence = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
