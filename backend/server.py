"""FastAPI entrypoint: mounts the mental health API under /api prefix.

Supervisor runs: uvicorn server:app
"""
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Initialise DB + models (creates tables on SQLite)
from app.db.database import Base, engine
from app import models  # noqa: F401  imports all models
Base.metadata.create_all(bind=engine)

# Initialise Firebase Admin SDK
from app.core import firebase  # noqa: F401

# Routers
from app.routes import (
    mood, journal, insights, chat, analytics, risk,
    assessment, user, patient, doctor, admin, appointment, upload,
)

app = FastAPI(title="Mental Health AI API", version="1.0.0")

api_router = APIRouter(prefix="/api")

api_router.include_router(user.router, prefix="/user", tags=["User"])
api_router.include_router(mood.router, prefix="/mood", tags=["Mood"])
api_router.include_router(journal.router, prefix="/journal", tags=["Journal"])
api_router.include_router(insights.router, prefix="/insights", tags=["Insights"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chatbot"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(risk.router, prefix="/risk", tags=["Risk"])
api_router.include_router(assessment.router, prefix="/assessment", tags=["Assessment"])
api_router.include_router(patient.router, prefix="/patient", tags=["Patient"])
api_router.include_router(doctor.router, prefix="/doctor", tags=["Doctor"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(appointment.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])

# Public download endpoint (no auth, for doctor avatars etc.)
from app.routes.upload import download_file as _download_file
api_router.add_api_route("/files/{path:path}", _download_file, methods=["GET"], tags=["Files"])


@api_router.get("/")
def root():
    return {"message": "Mental Health AI Backend Running"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
