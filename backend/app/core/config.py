import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mental_health.db")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "/app/backend/firebase-admin.json")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")
