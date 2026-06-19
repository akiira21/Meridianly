from datetime import date, datetime
from pydantic import BaseModel

from todos.models import EnergyLevel, Context, TodoStatus


class TodoCreateRequest(BaseModel):
    title: str
    description: str | None = None
    energy_level: EnergyLevel = EnergyLevel.MEDIUM
    context: Context = Context.ANY
    estimated_minutes: int | None = None
    status: TodoStatus = TodoStatus.ACTIVE
    is_daily: bool = False


class TodoUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    energy_level: EnergyLevel | None = None
    context: Context | None = None
    estimated_minutes: int | None = None
    status: TodoStatus | None = None
    snoozed_until: datetime | None = None
    done_for_day: bool | None = None
    is_daily: bool | None = None


class TodoResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    energy_level: EnergyLevel
    context: Context
    status: TodoStatus
    snoozed_until: datetime | None
    estimated_minutes: int | None
    actual_minutes: int | None
    completed_at: datetime | None
    done_for_day: bool
    is_daily: bool
    daily_last_reset_at: date | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TodoListResponse(BaseModel):
    items: list[TodoResponse]
    total: int


class SnoozeRequest(BaseModel):
    duration: str  # "1h", "tonight", "tomorrow", "next_week"


class FocusStartRequest(BaseModel):
    pass


class FocusEndRequest(BaseModel):
    actual_minutes: int


class DoneForDayRequest(BaseModel):
    carry_forward_unfinished: bool = True


class DoneForDayResponse(BaseModel):
    completed_today: int
    carried_forward: int
    archived: int
    message: str


class DailyEnsureResponse(BaseModel):
    reactivated: int
    items: list[TodoResponse]


class TodoFilterParams(BaseModel):
    energy_level: EnergyLevel | None = None
    context: Context | None = None
    status: TodoStatus | None = None
    done_for_day: bool | None = None


class AITodoRequest(BaseModel):
    prompt: str


class AITodoItem(BaseModel):
    title: str
    description: str | None
    energy_level: EnergyLevel
    context: Context
    estimated_minutes: int | None


class AITodoResponse(BaseModel):
    todos: list[AITodoItem]
    created_count: int


class UserPlanInfo(BaseModel):
    plan: str
    ai_requests_used: int
    ai_requests_limit: int
    ai_requests_remaining: int
    ai_requests_reset_at: datetime | None
