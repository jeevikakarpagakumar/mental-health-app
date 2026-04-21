from sqlalchemy import Column, Integer, ForeignKey, DateTime, JSON
from datetime import datetime, timezone
from app.db.database import Base


class Mood(Base):
    __tablename__ = "moods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mood_score = Column(Integer)
    emotions = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
