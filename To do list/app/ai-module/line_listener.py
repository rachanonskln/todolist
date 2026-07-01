"""Turns a single inbound LINE text message into zero or more Notion tasks.

The Backend API's LINE webhook handler (backend/src/routes/line.routes.ts)
forwards every plain-text message here rather than parsing it itself —
keeping all NLP in the Python module means the extraction prompt only
needs to be tuned in one place for both the email and LINE sources.
"""

from attachment_parser import SUPPORTED_MIME_TYPES, extract_text
from nlp_extractor import extract_tasks, extract_tasks_from_image
from notion_formatter import submit_task, to_task_payload

IMAGE_MIME_TYPES = {"image/jpeg", "image/png"}


async def process_line_message(line_user_id: str, text: str) -> list[dict]:
    extracted = extract_tasks(text)
    return await _submit_all(extracted, line_user_id)


async def process_line_file(
    line_user_id: str, mime_type: str, content: bytes
) -> list[dict]:
    """Handles any file LINE hands us — a photo, a PDF, a Word doc, or plain
    text — by routing it to the extraction path that matches its type. An
    unsupported type (e.g. a video) yields no tasks rather than erroring."""
    if mime_type in IMAGE_MIME_TYPES:
        extracted = extract_tasks_from_image(content, mime_type)
    elif mime_type in SUPPORTED_MIME_TYPES:
        extracted = extract_tasks(extract_text(mime_type, content))
    else:
        return []

    return await _submit_all(extracted, line_user_id)


async def _submit_all(extracted: list, line_user_id: str) -> list[dict]:
    created = []
    for task in extracted:
        payload = to_task_payload(task, source="ai_line", line_user_id=line_user_id)
        created.append(await submit_task(payload))
    return created
