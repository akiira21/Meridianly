import os
import sys
from dataclasses import dataclass
from typing import List

from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url: str) -> str:
    """Normalize DATABASE_URL for SQLAlchemy + Neon compatibility."""
    # Railway/Neon sometimes provide postgres:// instead of postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)

    # Neon requires SSL
    if ".neon.tech" in url and "sslmode=" not in url:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}sslmode=require"

    return url


@dataclass
class Config:
    ENVIRONMENT: str = os.getenv("ENV", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    API_BASE_URL: str = os.getenv("API_BASE_URL", f"http://localhost:{PORT}")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE: int = int(os.getenv("REFRESH_TOKEN_EXPIRE", 7))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    IS_DEVELOPMENT: bool = ENVIRONMENT in ("development", "test")

    def __post_init__(self):
        if not self.JWT_SECRET or len(self.JWT_SECRET) < 32:
            print("ERROR: JWT_SECRET must be set and at least 32 characters long.", file=sys.stderr)
            sys.exit(1)
        if not self.DATABASE_URL:
            print("ERROR: DATABASE_URL is required.", file=sys.stderr)
            sys.exit(1)
        self.DATABASE_URL = _normalize_database_url(self.DATABASE_URL)

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        if self.IS_DEVELOPMENT:
            return [
                "http://localhost:3000",
                "http://localhost:5173",
            ]
        client_urls = os.getenv("CLIENT_URLS", "").split(",")
        origins = [url.strip() for url in client_urls if url.strip()]
        if not origins:
            print("WARNING: CLIENT_URLS not set in production. CORS will be restricted.", file=sys.stderr)
            return []
        return origins
