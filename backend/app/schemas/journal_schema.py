from pydantic import BaseModel


class JournalCreate(BaseModel):
    text: str
