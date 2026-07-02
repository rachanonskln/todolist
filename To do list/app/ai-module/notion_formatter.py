"""Converts extracted tasks into the Backend API's task-creation payload
and submits them. Actual Notion writes happen in the Node backend
(services/notionService.ts) — this module never talks to Notion directly,
which keeps a single source of truth for the database schema/property
names and avoids two services fighting over Notion rate limits.
"""

import asyncio
from datetime import timedelta, datetime
from typing import Literal, Optional

import httpx

from config import settings
from nlp_extractor import ExtractedTask

DEFAULT_DURATION = timedelta(hours=1)

# Both services run on Render's free tier and spin down independently. When a
# LINE message wakes the ai-module, the backend may still be cold-starting, so
# its router returns 502/503 for a few seconds before the app is up. Retry
# those transient gateway errors instead of dropping the task.
_RETRY_STATUSES = {502, 503, 504}
_MAX_ATTEMPTS = 4


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
        last_error: Exception | None = None
        for attempt in range(_MAX_ATTEMPTS):
            response = await client.post(
                f"{settings.backend_url}/internal/ai/tasks",
                json=payload,
                headers={"x-internal-key": settings.internal_api_key},
                # Generous timeout: the backend cold-starts in ~50s on the free
                # tier — a short timeout made the whole pipeline fail while it
                # was still waking up.
                timeout=90.0,
            )
            if response.status_code in _RETRY_STATUSES:
                # Backend still cold-starting; wait and retry rather than
                # losing the extracted task.
                last_error = httpx.HTTPStatusError(
                    f"backend returned {response.status_code}",
                    request=response.request,
                    response=response,
                )
                await asyncio.sleep(2 * (attempt + 1))
                continue
            response.raise_for_status()
            return response.json()
        raise last_error  # type: ignore[misc]
