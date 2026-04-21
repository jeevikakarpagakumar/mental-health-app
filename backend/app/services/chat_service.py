"""Chatbot service using Emergent LLM with contextual user data."""
import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from app.models.mood import Mood
from app.models.journal import Journal


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


SYSTEM_TEMPLATE = """You are Aura — a warm, empathetic mental-health companion. \
Speak calmly, validate feelings, and offer gentle, practical coping strategies. \
Never diagnose. Never replace a clinician. If the user mentions self-harm or crisis, \
suggest helplines (AASRA: +91-9820466726, Kiran: 1800-599-0019).

User context: {context}
"""


async def generate_response(db, user_id: int, message: str) -> str:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    context = build_context(db, user_id)

    chat = LlmChat(
        api_key=api_key,
        session_id=f"chat-user-{user_id}",
        system_message=SYSTEM_TEMPLATE.format(context=context),
    ).with_model("openai", "gpt-4o-mini")

    try:
        response = await chat.send_message(UserMessage(text=message))
        return response
    except Exception as e:
        return f"I'm having trouble responding right now. Please try again in a moment. ({e})"
