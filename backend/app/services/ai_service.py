"""AI emotion classification using OpenAI LLM."""
import os
import re
import json
from openai import AsyncOpenAI

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

# Initialize async client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def analyze_emotion(text: str) -> dict:
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text}
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content

        # 🔧 Clean possible code fences
        cleaned = re.sub(r"```(?:json)?|```", "", content).strip()

        data = json.loads(cleaned)

        # ✅ Validation (same as your original)
        emotion = str(data.get("emotion", "neutral")).lower()
        if emotion not in EMOTION_LABELS:
            emotion = "neutral"

        confidence = float(data.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))

        return {"emotion": emotion, "confidence": confidence}

    except Exception as e:
        print("AI Error:", e)
        return {"emotion": "neutral", "confidence": 0.0}