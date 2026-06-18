from __future__ import annotations
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Boolean, func, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class FoodPreset(Base):
    __tablename__ = "food_presets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="general")
    calories_per_100g: Mapped[float] = mapped_column(Float, nullable=False)
    protein_per_100g: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    carbs_per_100g: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    fat_per_100g: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class FoodLog(Base):
    __tablename__ = "food_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    food_preset_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("food_presets.id"), nullable=True)
    food_name: Mapped[str] = mapped_column(String(100), nullable=False)
    amount_g: Mapped[int] = mapped_column(Integer, nullable=False)
    calculated_calories: Mapped[float] = mapped_column(Float, nullable=False)
    calculated_protein: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    calculated_carbs: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    calculated_fat: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    logged_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
