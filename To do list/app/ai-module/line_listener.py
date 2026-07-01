"""Turns a single inbound LINE text message into zero or more Notion tasks.

The Backend API's LINE webhook handler (backend/src/routes/line.routes.ts)
forwards every plain-text message here rather than parsing it itself —
keeping all NLP in the Python module means the extraction prompt only
needs to be tuned in one place for both the email and LINE sources.
"""

from nlp_extractor import extract_tasks
from notion_formatter import submit_task, to_task_payload


async def process_line_message(line_user_id: str, text: str) -> list[dict]:
    extracted = extract_tasks(text)

    created = []
    for task in extracted:
        payload = to_task_payload(task, source="ai_line", line_user_id=line_user_id)
        created.append(await submit_task(payload))
    return created
