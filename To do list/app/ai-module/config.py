import os
from dotenv import load_dotenv

load_dotenv()


def _required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


class Settings:
    gemini_api_key: str = _required("GEMINI_API_KEY")
    backend_url: str = os.environ.get("BACKEND_URL", "http://localhost:4000")
    internal_api_key: str = _required("INTERNAL_API_KEY")

    # Gmail OAuth2 (per-user tokens stored server-side, one refresh token per
    # connected mailbox — see email_connector.get_credentials).
    google_client_id: str = os.environ.get("GOOGLE_CLIENT_ID", "")
    google_client_secret: str = os.environ.get("GOOGLE_CLIENT_SECRET", "")


settings = Settings()
