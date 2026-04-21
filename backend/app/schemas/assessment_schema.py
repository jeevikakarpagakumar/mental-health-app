from pydantic import BaseModel
from typing import List


class AssessmentCreate(BaseModel):
    type: str  # PHQ9 or GAD7
    answers: List[int]
