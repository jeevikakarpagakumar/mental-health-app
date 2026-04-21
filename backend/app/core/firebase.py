import firebase_admin
from firebase_admin import credentials
from app.core.config import FIREBASE_CREDENTIALS_PATH

# Idempotent init (avoid duplicate init on hot reload)
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)
