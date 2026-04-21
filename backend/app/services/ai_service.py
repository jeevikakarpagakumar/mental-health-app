"""AI emotion classification using Emergent LLM (GPT)."""
import os
import re
import json
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage

EMOTION_LABELS = [
    "joy", "sadness", "anger", "fear", "love",
    "gratitude", "nervousness", "optimism",
    "grief", "remorse", "surprise", "neutral",
]

SYSTEM_PROMPT = f"""You are an emotion classifier for mental health journal entries.
Classify the primary emotion of the text into exactly ONE of these labels:
{", ".join(EMOTION_LABELS)}.

Respond ONLY in valid JSON of the form:
{{"emotion": "<label>", "confidence": <float between 0 and 1>}}

No prose, no markdown, no code fences."""


async def analyze_emotion(text: str) -> dict:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"emotion-{uuid.uuid4()}",
        system_message=SYSTEM_PROMPT,
    ).with_model("openai", "gpt-4o-mini")

    try:
        response = await chat.send_message(UserMessage(text=text))
        # Strip possible code fences
        cleaned = re.sub(r"```(?:json)?|```", "", response).strip()
        data = json.loads(cleaned)
        emotion = str(data.get("emotion", "neutral")).lower()
        if emotion not in EMOTION_LABELS:
            emotion = "neutral"
        confidence = float(data.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))
        return {"emotion": emotion, "confidence": confidence}
    except Exception:
        return {"emotion": "neutral", "confidence": 0.0}
