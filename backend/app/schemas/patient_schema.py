from pydantic import BaseModel


class PatientProfileCreate(BaseModel):
    age: int
    gender: str
    medical_history: str
