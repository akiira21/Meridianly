from fastapi import APIRouter
from database import db

from auth.router import auth_router

v1_router = APIRouter()

v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])


@v1_router.get("/health")
def health():
    return {
        "status": "ok",
        "database": "ok" if db.ping() else "error"
    }
