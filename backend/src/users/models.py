from __future__ import annotations
from enum import Enum
from sqlalchemy import String, DateTime, Boolean, Enum as SQLEnum, func, Integer
from sqlalchemy.orm import Mapped, mapped_column

from datetime import datetime

from database import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class UserPlan(str, Enum):
    FREE = "free"
    MID = "mid"
    MAX = "max"


class Users(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), name="user_role", nullable=False, default=UserRole.USER)
    avatar_url: Mapped[str] = mapped_column(String(2083), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    plan: Mapped[UserPlan] = mapped_column(SQLEnum(UserPlan), name="user_plan", nullable=False, default=UserPlan.FREE)
    ai_requests_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ai_requests_reset_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
