from collections import Counter
from app.models.mood import Mood
from app.models.journal import Journal


def generate_insights(db, user_id):
    moods = db.query(Mood).filter(Mood.user_id == user_id).all()
    journals = db.query(Journal).filter(Journal.user_id == user_id).all()

    insights = []

    if moods:
        avg = sum(m.mood_score for m in moods) / len(moods)
        if avg < 4:
            insights.append("Your mood has been low recently. Be gentle with yourself.")
        elif avg > 7:
            insights.append("You've been feeling positive lately — keep it up!")
        else:
            insights.append(f"Your average mood is {avg:.1f}/10.")

    if journals:
        emotions = [j.emotion for j in journals if j.emotion]
        if emotions:
            common = Counter(emotions).most_common(1)[0][0]
            insights.append(f"You often feel '{common}' in your journal entries.")

    if not insights:
        insights.append("Start logging your mood and journaling to see personalized insights.")

    return insights
