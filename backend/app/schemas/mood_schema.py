from pydantic import BaseModel
from typing import List


class MoodCreate(BaseModel):
    mood_score: int
    emotions: List[str]
