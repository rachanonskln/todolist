"""AI Processing Module entrypoint (FastAPI).

Two triggers feed this service:
  1. Backend API webhook forwarding -> POST /analyze/line-message
     (real-time, one message at a time)
  2. Scheduler Service cron tick   -> POST /scan/emails
     (periodic, sweeps every connected mailbox)

Both paths converge on the same extract -> format -> submit-to-backend
pipeline (nlp_extractor -> notion_formatter), so accuracy improvements to
the Gemini prompt benefit both sources at once.
"""

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from config import settings
from email_connector import fetch_unread_messages
from line_listener import process_line_message
from nlp_extractor import extract_tasks
from notion_formatter import submit_task, to_task_payload

app = FastAPI(title="AI Processing Module")


class LineMessagePayload(BaseModel):
    lineUserId: str
    text: str
    timestamp: int


@app.post("/analyze/line-message")
async def analyze_line_message(payload: LineMessagePayload):
    created = await process_line_message(payload.lineUserId, payload.text)
    return {"tasksCreated": len(created), "tasks": created}


class EmailScanUser(BaseModel):
    userId: str
    gmailRefreshToken: str
    lineUserId: str | None = None


@app.post("/scan/emails")
async def scan_emails():
    """Triggered by the Scheduler Service. Iterates every user who has
    connected Gmail, pulls their unread mail, and extracts tasks from the
    body + any supported attachment.
    """
    users = await _get_connected_email_users()
    total_created = 0

    for user in users:
        for message in fetch_unread_messages(user.gmailRefreshToken):
            source_text = "\n\n".join(
                [message.subject, message.body_text, *[a.text for a in message.attachments]]
            )
            for extracted in extract_tasks(source_text):
                payload = to_task_payload(extracted, source="ai_email", line_user_id=user.lineUserId)
                await submit_task(payload)
                total_created += 1

    return {"usersScanned": len(users), "tasksCreated": total_created}


async def _get_connected_email_users() -> list[EmailScanUser]:
    """Asks the Backend API which users currently have Gmail connected.
    (Conceptual endpoint: GET /internal/users/email-connected — the Backend
    owns the Notion Users database, so it's the source of truth for who has
    a stored refresh token.)
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.backend_url}/internal/users/email-connected",
            headers={"x-internal-key": settings.internal_api_key},
            timeout=10.0,
        )
        if response.status_code == 404:
            # Endpoint not wired up yet in this environment.
            return []
        response.raise_for_status()
        return [EmailScanUser(**item) for item in response.json()]


@app.get("/healthz")
async def healthz():
    return {"ok": True}
