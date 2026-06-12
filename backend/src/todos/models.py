from __future__ import annotations
from enum import Enum
from sqlalchemy import String, DateTime, Boolean, Enum as SQLEnum, Integer, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from datetime import datetime

from database import Base


class EnergyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Context(str, Enum):
    DESK = "desk"
    PHONE = "phone"
    ERRANDS = "errands"
    QUICK = "quick"
    ANY = "any"


class TodoStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    SNOOZED = "snoozed"
    ARCHIVED = "archived"
    PARKING_LOT = "parking_lot"


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    energy_level: Mapped[EnergyLevel] = mapped_column(
        SQLEnum(EnergyLevel), name="energy_level", nullable=False, default=EnergyLevel.MEDIUM
    )
    context: Mapped[Context] = mapped_column(
        SQLEnum(Context), name="context", nullable=False, default=Context.ANY
    )
    status: Mapped[TodoStatus] = mapped_column(
        SQLEnum(TodoStatus), name="status", nullable=False, default=TodoStatus.ACTIVE
    )

    snoozed_until: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
    actual_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    done_for_day: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
