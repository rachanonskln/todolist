"""Converts extracted tasks into the Backend API's task-creation payload
and submits them. Actual Notion writes happen in the Node backend
(services/notionService.ts) — this module never talks to Notion directly,
which keeps a single source of truth for the database schema/property
names and avoids two services fighting over Notion rate limits.
"""

from datetime import timedelta, datetime
from typing import Literal, Optional

import httpx

from config import settings
from nlp_extractor import ExtractedTask

DEFAULT_DURATION = timedelta(hours=1)


def to_task_payload(
    task: ExtractedTask,
    source: Literal["ai_email", "ai_line"],
    line_user_id: Optional[str] = None,
) -> dict:
    start = task.due_date or datetime.utcnow().isoformat()
    end = (datetime.fromisoformat(start) + DEFAULT_DURATION).isoformat()

    return {
        "title": task.title,
        "description": task.description,
        "startDate": start,
        "endDate": end,
        "priority": task.priority,
        "lineUserId": line_user_id,
        "source": source,
    }


async def submit_task(payload: dict) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.backend_url}/internal/ai/tasks",
            json=payload,
            headers={"x-internal-key": settings.internal_api_key},
            # Generous timeout: the backend runs on Render's free tier, which
            # spins down when idle and takes ~50s to cold-start — a 10s timeout
            # here made the whole pipeline 500 whenever the backend was asleep.
            timeout=90.0,
        )
        response.raise_for_status()
        return response.json()
