from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db_session
from middleware.decorators import require_auth, rate_limit
from food.schemas import (
    FoodPresetCreateRequest,
    FoodPresetResponse,
    FoodPresetListResponse,
    FoodLogCreateRequest,
    FoodLogResponse,
    FoodLogListResponse,
    TodayFoodResponse,
    DailyNutritionSummary,
)
from food.services import FoodService


food_router = APIRouter()


@food_router.get("/presets", response_model=FoodPresetListResponse)
@require_auth
@rate_limit("120/minute")
def list_presets(
    category: str | None = Query(None),
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    items = FoodService.get_presets(db, user["user_id"], category=category)
    return FoodPresetListResponse(
        items=[FoodPresetResponse.model_validate(i) for i in items],
        total=len(items),
    )


@food_router.post("/presets", response_model=FoodPresetResponse, status_code=201)
@require_auth
@rate_limit("30/minute")
def create_preset(
    data: FoodPresetCreateRequest,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    preset = FoodService.create_custom_preset(db, user["user_id"], data)
    return FoodPresetResponse.model_validate(preset)


@food_router.delete("/presets/{preset_id}")
@require_auth
@rate_limit("30/minute")
def delete_preset(
    preset_id: int,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    deleted = FoodService.delete_preset(db, preset_id, user["user_id"])
    if not deleted:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Preset not found or cannot be deleted")
    return {"message": "Preset deleted successfully"}


@food_router.post("/log", response_model=FoodLogResponse, status_code=201)
@require_auth
@rate_limit("60/minute")
def log_food(
    data: FoodLogCreateRequest,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    log = FoodService.log_food(db, user["user_id"], data)
    return FoodLogResponse.model_validate(log)


@food_router.get("/today", response_model=TodayFoodResponse)
@require_auth
@rate_limit("120/minute")
def get_today(
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    result = FoodService.get_today_logs(db, user["user_id"])
    return TodayFoodResponse(
        logs=[FoodLogResponse.model_validate(l) for l in result["logs"]],
        summary=DailyNutritionSummary(**result["summary"]),
    )


@food_router.get("/history", response_model=FoodLogListResponse)
@require_auth
@rate_limit("120/minute")
def get_history(
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    items, total = FoodService.get_history(db, user["user_id"], limit=limit, offset=offset)
    return FoodLogListResponse(
        items=[FoodLogResponse.model_validate(i) for i in items],
        total=total,
    )


@food_router.delete("/log/{log_id}")
@require_auth
@rate_limit("60/minute")
def delete_log(
    log_id: int,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    deleted = FoodService.delete_log(db, log_id, user["user_id"])
    if not deleted:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Log entry not found")
    return {"message": "Log entry deleted successfully"}
