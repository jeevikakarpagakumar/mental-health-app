from pydantic import BaseModel
from typing import Optional


class SetRole(BaseModel):
    role: str  # patient / doctor / admin
    name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    name: Optional[str] = None

    class Config:
        from_attributes = True
