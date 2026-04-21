"""Chatbot service using OpenAI LLM with contextual user data."""
import os
from openai import AsyncOpenAI
from app.models.mood import Mood
from app.models.journal import Journal

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def build_context(db, user_id: int) -> str:
    moods = db.query(Mood).filter(Mood.user_id == user_id).all()
    journals = db.query(Journal).filter(Journal.user_id == user_id).all()

    context_parts = []

    if moods:
        avg = sum(m.mood_score for m in moods) / len(moods)
        context_parts.append(f"Average mood score: {avg:.1f}/10 across {len(moods)} entries.")

    if journals:
        recent = [j.emotion for j in journals[-5:] if j.emotion]
        if recent:
            context_parts.append(f"Recent detected emotions: {', '.join(recent)}.")

    if not context_parts:
        return "This is a new user with no prior data."

    return " ".join(context_parts)


SYSTEM_TEMPLATE = """You are Aura — a warm, empathetic mental-health companion.
Speak calmly, validate feelings, and offer gentle, practical coping strategies.
Never diagnose. Never replace a clinician. If the user mentions self-harm or crisis,
suggest helplines (AASRA: +91-9820466726, Kiran: 1800-599-0019).

User context: {context}
"""


async def generate_response(db, user_id: int, message: str) -> str:
    context = build_context(db, user_id)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_TEMPLATE.format(context=context)
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.7
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Chatbot Error:", e)
        return "I'm having trouble responding right now. Please try again in a moment."