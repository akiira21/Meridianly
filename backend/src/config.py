import os
from dataclasses import dataclass
from typing import List

from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    ENVIRONMENT: str = os.getenv("ENV", "development")
    HOST:str = os.getenv("HOST", "0.0.0.0")
    PORT:int = int(os.getenv("PORT", 8000))
    API_BASE_URL:str = os.getenv("API_BASE_URL", f"http://localhost:{PORT}")
    DATABASE_URL:str | None = os.getenv("DATABASE_URL")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE: int = int(os.getenv("REFRESH_TOKEN_EXPIRE", 7))


    IS_DEVELOPMENT: bool = ENVIRONMENT == "development" 

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        if self.IS_DEVELOPMENT:
            return [
                "http://localhost:3000",
                "http://localhost:5173",
            ]
        client_urls = os.getenv("CLIENT_URLS", "").split(",")
        origins = [url.strip() for url in client_urls if url.strip()]
        return origins if origins else [""]
