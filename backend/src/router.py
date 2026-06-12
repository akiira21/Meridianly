from fastapi import APIRouter
from database import db

from auth.router import auth_router
from todos.router import todos_router
from ai.router import ai_router

v1_router = APIRouter()

v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
v1_router.include_router(todos_router, prefix="/todos", tags=["todos"])
v1_router.include_router(ai_router, prefix="/ai", tags=["ai"])


@v1_router.get("/health")
def health():
    return {
        "status": "ok",
        "database": "ok" if db.ping() else "error"
    }
