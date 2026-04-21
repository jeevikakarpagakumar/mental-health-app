from app.models.mood import Mood
from app.models.journal import Journal


def detect_risk(db, user_id):
    moods = db.query(Mood).filter(Mood.user_id == user_id).all()
    journals = db.query(Journal).filter(Journal.user_id == user_id).all()

    warnings = []
    risk_score = 0

    if moods:
        low = [m for m in moods if m.mood_score <= 4]
        if len(low) >= 3:
            warnings.append("Consistently low mood detected.")
            risk_score += 2

    negative = ["sadness", "grief", "remorse"]
    anxiety = ["fear", "nervousness"]

    if journals:
        emotions = [j.emotion for j in journals if j.emotion]

        if sum(e in negative for e in emotions) >= 3:
            warnings.append("Frequent emotional distress detected.")
            risk_score += 2

        if sum(e in anxiety for e in emotions) >= 3:
            warnings.append("Frequent anxiety patterns detected.")
            risk_score += 2

    level = "low"
    if risk_score >= 4:
        level = "high"
    elif risk_score >= 2:
        level = "medium"

    return {"risk_level": level, "warnings": warnings}
