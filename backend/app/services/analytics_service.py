from collections import Counter
from app.models.mood import Mood
from app.models.journal import Journal


def get_analytics(db, user_id):
    moods = db.query(Mood).filter(Mood.user_id == user_id).all()
    journals = db.query(Journal).filter(Journal.user_id == user_id).all()

    mood_trend = sorted(
        [
            {"date": m.created_at.strftime("%Y-%m-%d"), "mood": m.mood_score}
            for m in moods
        ],
        key=lambda x: x["date"],
    )

    emotions = [j.emotion for j in journals if j.emotion]
    emotion_distribution = dict(Counter(emotions))

    return {
        "mood_trend": mood_trend,
        "emotion_distribution": emotion_distribution,
        "total_moods": len(moods),
        "total_journals": len(journals),
    }
