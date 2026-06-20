from fastapi import APIRouter
from database import db

from auth.router import auth_router
from todos.router import todos_router
from ai.router import ai_router
from ai.insights_router import insights_router
from water.router import water_router
from notes.router import notes_router
from food.router import food_router

v1_router = APIRouter()

v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
v1_router.include_router(todos_router, prefix="/todos", tags=["todos"])
v1_router.include_router(ai_router, prefix="/ai", tags=["ai"])
v1_router.include_router(insights_router, prefix="/ai", tags=["ai"])
v1_router.include_router(water_router, prefix="/water", tags=["water"])
v1_router.include_router(notes_router, prefix="/notes", tags=["notes"])
v1_router.include_router(food_router, prefix="/food", tags=["food"])


@v1_router.get("/health")
def health():
    return {
        "status": "ok",
        "database": "ok" if db.ping() else "error"
    }
