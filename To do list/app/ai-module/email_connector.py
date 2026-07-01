"""Gmail connector: fetches unread messages + attachments for AI scanning.

Conceptual notes on the OAuth2 flow (not implemented here, since it's a
one-time per-user setup handled by the Settings page):
  1. Frontend Settings page starts Google's OAuth2 consent screen requesting
     the `gmail.readonly` scope.
  2. On consent, Google redirects back with an auth code; the Backend API
     exchanges it for a refresh token and stores it against the user's
     Notion "Users" record (NotionApiKey-style secret field).
  3. This module loads that refresh token per user and mints short-lived
     access tokens via `Credentials.refresh()` before each scan.
"""

import base64
from dataclasses import dataclass
from typing import Iterable

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from attachment_parser import SUPPORTED_MIME_TYPES, extract_text
from config import settings


@dataclass
class EmailAttachment:
    filename: str
    mime_type: str
    text: str


@dataclass
class EmailMessage:
    message_id: str
    sender: str
    subject: str
    body_text: str
    attachments: list[EmailAttachment]


def get_credentials(refresh_token: str) -> Credentials:
    return Credentials(
        token=None,
        refresh_token=refresh_token,
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/gmail.readonly"],
    )


def fetch_unread_messages(refresh_token: str, max_results: int = 10) -> Iterable[EmailMessage]:
    """Pulls unread inbox messages and decodes body + supported attachments."""
    service = build("gmail", "v1", credentials=get_credentials(refresh_token))

    response = (
        service.users()
        .messages()
        .list(userId="me", labelIds=["INBOX", "UNREAD"], maxResults=max_results)
        .execute()
    )

    for meta in response.get("messages", []):
        full = service.users().messages().get(userId="me", id=meta["id"], format="full").execute()
        yield _parse_message(service, full)


def _parse_message(service, full_message: dict) -> EmailMessage:
    headers = {h["name"]: h["value"] for h in full_message["payload"].get("headers", [])}
    payload = full_message["payload"]

    body_text = _extract_body_text(payload)
    attachments = list(_extract_attachments(service, full_message["id"], payload))

    return EmailMessage(
        message_id=full_message["id"],
        sender=headers.get("From", ""),
        subject=headers.get("Subject", ""),
        body_text=body_text,
        attachments=attachments,
    )


def _extract_body_text(payload: dict) -> str:
    parts = payload.get("parts", [payload])
    for part in parts:
        if part.get("mimeType") == "text/plain" and "data" in part.get("body", {}):
            return base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
    return ""


def _extract_attachments(service, message_id: str, payload: dict) -> Iterable[EmailAttachment]:
    for part in payload.get("parts", []):
        mime_type = part.get("mimeType", "")
        attachment_id = part.get("body", {}).get("attachmentId")
        if mime_type not in SUPPORTED_MIME_TYPES or not attachment_id:
            continue

        raw = (
            service.users()
            .messages()
            .attachments()
            .get(userId="me", messageId=message_id, id=attachment_id)
            .execute()
        )
        content = base64.urlsafe_b64decode(raw["data"])
        yield EmailAttachment(
            filename=part.get("filename", "attachment"),
            mime_type=mime_type,
            text=extract_text(mime_type, content),
        )
