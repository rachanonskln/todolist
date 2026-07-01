"""Extracts plain text from email attachments so it can be fed to the LLM.

Only text extraction lives here — no NLP. Keeping format-specific parsing
isolated means adding a new attachment type (e.g. .xlsx) never touches the
extraction/Notion-writing logic in nlp_extractor.py / notion_formatter.py.
"""

import io
from pypdf import PdfReader
from docx import Document

SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


def extract_text(mime_type: str, content: bytes) -> str:
    if mime_type == "application/pdf":
        return _extract_pdf(content)
    if mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return _extract_docx(content)
    if mime_type == "text/plain":
        return content.decode("utf-8", errors="ignore")
    raise ValueError(f"Unsupported attachment type: {mime_type}")


def _extract_pdf(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_docx(content: bytes) -> str:
    document = Document(io.BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs)
