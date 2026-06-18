from datetime import datetime
from pydantic import BaseModel, Field


class FoodPresetCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(default="general", max_length=50)
    calories_per_100g: float = Field(..., ge=0)
    protein_per_100g: float = Field(default=0.0, ge=0)
    carbs_per_100g: float = Field(default=0.0, ge=0)
    fat_per_100g: float = Field(default=0.0, ge=0)


class FoodPresetResponse(BaseModel):
    id: int
    name: str
    category: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    is_system: bool
    user_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class FoodPresetListResponse(BaseModel):
    items: list[FoodPresetResponse]
    total: int


class FoodLogCreateRequest(BaseModel):
    food_preset_id: int | None = None
    food_name: str = Field(..., min_length=1, max_length=100)
    amount_g: int = Field(..., ge=1, le=5000)
    calories: float = Field(..., ge=0)
    protein: float = Field(default=0.0, ge=0)
    carbs: float = Field(default=0.0, ge=0)
    fat: float = Field(default=0.0, ge=0)


class FoodLogResponse(BaseModel):
    id: int
    user_id: int
    food_preset_id: int | None
    food_name: str
    amount_g: int
    calculated_calories: float
    calculated_protein: float
    calculated_carbs: float
    calculated_fat: float
    logged_at: datetime

    class Config:
        from_attributes = True


class FoodLogListResponse(BaseModel):
    items: list[FoodLogResponse]
    total: int


class DailyNutritionSummary(BaseModel):
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    entry_count: int


class TodayFoodResponse(BaseModel):
    logs: list[FoodLogResponse]
    summary: DailyNutritionSummary
