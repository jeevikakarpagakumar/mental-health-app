from firebase_admin import auth
from fastapi import HTTPException

# Ensure Firebase Admin SDK is initialized
from app.core import firebase  # noqa: F401


def verify_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
