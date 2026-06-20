from datetime import datetime, timedelta
from typing import Any
from pydantic import BaseModel


class AIInsightItemContent(BaseModel):
    title: str
    message: str
    tips: list[str]


class AIInsightResponseItem(BaseModel):
    id: int
    insight_type: str
    title: str
    message: str
    tips: list[str]
    generated_at: datetime
    is_read: bool

    class Config:
        from_attributes = True


class AIInsightResponse(BaseModel):
    insights: list[AIInsightResponseItem]
    generated_at: datetime | None
