from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db_session
from todos.schemas import (
    TodoCreateRequest,
    TodoUpdateRequest,
    TodoResponse,
    TodoListResponse,
    TodoFilterParams,
    SnoozeRequest,
    FocusStartRequest,
    FocusEndRequest,
    DoneForDayRequest,
    DoneForDayResponse,
)
from todos.services import TodoService


todos_router = APIRouter()


@todos_router.post("", response_model=TodoResponse, status_code=201)
def create_todo(
    data: TodoCreateRequest,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todo = TodoService.create_todo(db, user["user_id"], data)
    return TodoResponse.model_validate(todo)


@todos_router.get("", response_model=TodoListResponse)
def list_todos(
    energy_level: str | None = Query(None),
    context: str | None = Query(None),
    status: str | None = Query(None),
    done_for_day: bool | None = Query(None),
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todos = TodoService.get_all(
        db, user["user_id"],
        energy_level=energy_level,
        context=context,
        status=status,
        done_for_day=done_for_day,
    )
    return TodoListResponse(
        items=[TodoResponse.model_validate(t) for t in todos],
        total=len(todos),
    )


@todos_router.get("/suggest")
def suggest_todos(
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todos = TodoService.suggest_by_energy(db, user["user_id"])
    return {
        "suggested": [TodoResponse.model_validate(t) for t in todos],
        "hour": None,
    }


@todos_router.get("/stats")
def get_stats(
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return TodoService.get_stats(db, user["user_id"])


@todos_router.get("/parking-lot", response_model=TodoListResponse)
def get_parking_lot(
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    from todos.repository import TodoRepository
    todos = TodoRepository.get_parking_lot(db, user["user_id"])
    return TodoListResponse(
        items=[TodoResponse.model_validate(t) for t in todos],
        total=len(todos),
    )


@todos_router.post("/done-for-day", response_model=DoneForDayResponse)
def done_for_day(
    data: DoneForDayRequest,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return TodoService.done_for_day(db, user["user_id"], data.carry_forward_unfinished)


@todos_router.post("/reactivate-snoozed")
def reactivate_snoozed(
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todos = TodoService.reactivate_snoozed(db, user["user_id"])
    return {
        "reactivated": len(todos),
        "items": [TodoResponse.model_validate(t) for t in todos],
    }


@todos_router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todo = TodoService.get_todo(db, todo_id, user["user_id"])
    return TodoResponse.model_validate(todo)


@todos_router.patch("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    data: TodoUpdateRequest,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todo = TodoService.update_todo(db, todo_id, user["user_id"], data)
    return TodoResponse.model_validate(todo)


@todos_router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    TodoService.delete_todo(db, todo_id, user["user_id"])
    return {"message": "Todo deleted successfully"}


@todos_router.post("/{todo_id}/snooze", response_model=TodoResponse)
def snooze_todo(
    todo_id: int,
    data: SnoozeRequest,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todo = TodoService.snooze_todo(db, todo_id, user["user_id"], data)
    return TodoResponse.model_validate(todo)


@todos_router.post("/{todo_id}/focus/start", response_model=TodoResponse)
def start_focus(
    todo_id: int,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todo = TodoService.start_focus(db, todo_id, user["user_id"])
    return TodoResponse.model_validate(todo)


@todos_router.post("/{todo_id}/focus/end", response_model=TodoResponse)
def end_focus(
    todo_id: int,
    data: FocusEndRequest,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todo = TodoService.end_focus(db, todo_id, user["user_id"], data.actual_minutes)
    return TodoResponse.model_validate(todo)


@todos_router.post("/{todo_id}/promote", response_model=TodoResponse)
def promote_todo(
    todo_id: int,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
):
    todo = TodoService.promote_from_parking_lot(db, todo_id, user["user_id"])
    return TodoResponse.model_validate(todo)
