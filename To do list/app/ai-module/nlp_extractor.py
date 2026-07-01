"""LLM-based entity extraction shared by the email and LINE pipelines.

Both pipelines eventually produce free text (email body + attachments, or a
LINE chat message). This module is the single place that turns that text
into structured task candidates, so the extraction prompt/schema only needs
to be maintained once.
"""

import json
from datetime import datetime
from typing import Optional

import google.generativeai as genai
from pydantic import BaseModel, ValidationError

from config import settings

genai.configure(api_key=settings.gemini_api_key)

_MODEL_NAME = "gemini-1.5-flash"

_EXTRACTION_PROMPT = """You are a task-extraction assistant embedded in a to-do app.
Read the SOURCE TEXT and identify any concrete tasks, deadlines, or events a
person should track. Ignore greetings, signatures, and unrelated chatter.

Return ONLY a JSON array (no markdown fences) where each item matches:
{{
  "title": string,               // short, actionable task title
  "description": string,         // 1-2 sentence context, may be empty
  "due_date": string | null,     // ISO 8601 datetime, null if no deadline is stated
  "priority": "low" | "medium" | "high"
}}
If there are no actionable tasks, return [].

Current date/time for resolving relative dates (e.g. "next Friday"): {now}

SOURCE TEXT:
---
{source_text}
---
"""


class ExtractedTask(BaseModel):
    title: str
    description: str = ""
    due_date: Optional[str] = None
    priority: str = "medium"


def extract_tasks(source_text: str) -> list[ExtractedTask]:
    if not source_text.strip():
        return []

    model = genai.GenerativeModel(_MODEL_NAME)
    prompt = _EXTRACTION_PROMPT.format(now=datetime.utcnow().isoformat(), source_text=source_text)

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )

    try:
        raw_items = json.loads(response.text)
    except json.JSONDecodeError:
        return []

    tasks: list[ExtractedTask] = []
    for item in raw_items:
        try:
            tasks.append(ExtractedTask(**item))
        except ValidationError:
            continue  # Skip malformed items rather than failing the whole batch.
    return tasks
