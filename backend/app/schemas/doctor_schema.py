from pydantic import BaseModel


class DoctorRegister(BaseModel):
    name: str
    specialization: str
    experience: int
    qualification: str
    image_url: str
