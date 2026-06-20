from __future__ import annotations
from datetime import datetime
from typing import Any
from sqlalchemy import DateTime, ForeignKey, Integer, String, Boolean, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    insight_type: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
