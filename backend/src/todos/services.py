from datetime import datetime, timedelta
from fastapi import HTTPException

from todos.models import Todo, TodoStatus, EnergyLevel, Context
from todos.repository import TodoRepository
from todos.schemas import TodoCreateRequest, TodoUpdateRequest, SnoozeRequest, DoneForDayResponse


class TodoService:
    @staticmethod
    def create_todo(db, user_id: int, data: TodoCreateRequest) -> Todo:
        todo_data = {
            "user_id": user_id,
            "title": data.title,
            "description": data.description,
            "energy_level": data.energy_level,
            "context": data.context,
            "estimated_minutes": data.estimated_minutes,
            "status": data.status,
        }
        return TodoRepository.create(db, todo_data)

    @staticmethod
    def get_all(
        db,
        user_id: int,
        status: str | None = None,
        energy_level: str | None = None,
        context: str | None = None,
        done_for_day: bool | None = None,
    ) -> list:
        return TodoRepository.get_all(
            db, user_id,
            status=status,
            energy_level=energy_level,
            context=context,
            done_for_day=done_for_day,
        )

    @staticmethod
    def get_todo(db, todo_id: int, user_id: int) -> Todo:
        todo = TodoRepository.get_by_id(db, todo_id, user_id)
        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found")
        return todo

    @staticmethod
    def update_todo(db, todo_id: int, user_id: int, data: TodoUpdateRequest) -> Todo:
        todo = TodoService.get_todo(db, todo_id, user_id)
        update_data = data.model_dump(exclude_unset=True)

        if "status" in update_data and update_data["status"] == TodoStatus.COMPLETED:
            update_data["completed_at"] = datetime.now()
        elif "status" in update_data and update_data["status"] == TodoStatus.ACTIVE:
            update_data["completed_at"] = None
            update_data["snoozed_until"] = None

        return TodoRepository.update(db, todo, update_data)

    @staticmethod
    def delete_todo(db, todo_id: int, user_id: int) -> bool:
        todo = TodoService.get_todo(db, todo_id, user_id)
        return TodoRepository.delete(db, todo)

    @staticmethod
    def snooze_todo(db, todo_id: int, user_id: int, data: SnoozeRequest) -> Todo:
        todo = TodoService.get_todo(db, todo_id, user_id)
        now = datetime.now()

        if data.duration == "1h":
            snoozed_until = now + timedelta(hours=1)
        elif data.duration == "tonight":
            snoozed_until = now.replace(hour=20, minute=0, second=0, microsecond=0)
            if snoozed_until <= now:
                snoozed_until += timedelta(days=1)
        elif data.duration == "tomorrow":
            snoozed_until = now + timedelta(days=1)
            snoozed_until = snoozed_until.replace(hour=9, minute=0, second=0, microsecond=0)
        elif data.duration == "next_week":
            snoozed_until = now + timedelta(days=7)
            snoozed_until = snoozed_until.replace(hour=9, minute=0, second=0, microsecond=0)
        else:
            raise HTTPException(status_code=400, detail="Invalid snooze duration")

        return TodoRepository.update(
            db, todo,
            {"status": TodoStatus.SNOOZED, "snoozed_until": snoozed_until}
        )

    @staticmethod
    def start_focus(db, todo_id: int, user_id: int) -> Todo:
        todo = TodoService.get_todo(db, todo_id, user_id)
        # In a real app, you'd track focus start time in a separate table or Redis
        return todo

    @staticmethod
    def end_focus(db, todo_id: int, user_id: int, actual_minutes: int) -> Todo:
        todo = TodoService.get_todo(db, todo_id, user_id)
        return TodoRepository.update(
            db, todo,
            {"actual_minutes": actual_minutes}
        )

    @staticmethod
    def done_for_day(db, user_id: int, carry_forward: bool = True) -> DoneForDayResponse:
        active_todos = TodoRepository.get_active_todos(db, user_id)
        completed_today = TodoRepository.get_completed_today(db, user_id)

        completed_count = len(completed_today)
        carried_count = 0
        archived_count = 0

        for todo in active_todos:
            if carry_forward:
                todo.status = TodoStatus.SNOOZED
                tomorrow = datetime.now() + timedelta(days=1)
                todo.snoozed_until = tomorrow.replace(hour=9, minute=0, second=0, microsecond=0)
                todo.done_for_day = True
                carried_count += 1
            else:
                todo.status = TodoStatus.ARCHIVED
                todo.done_for_day = True
                archived_count += 1

        TodoRepository.bulk_update(db, active_todos)

        messages = [
            "You moved mountains today.",
            "Small steps lead to big changes.",
            "Progress, not perfection.",
            "You showed up today. That's what matters.",
        ]
        message = messages[completed_count % len(messages)] if completed_count > 0 else "Rest is productive too."

        return DoneForDayResponse(
            completed_today=completed_count,
            carried_forward=carried_count,
            archived=archived_count,
            message=message,
        )

    @staticmethod
    def promote_from_parking_lot(db, todo_id: int, user_id: int) -> Todo:
        todo = TodoService.get_todo(db, todo_id, user_id)
        if todo.status != TodoStatus.PARKING_LOT:
            raise HTTPException(status_code=400, detail="Todo is not in parking lot")
        return TodoRepository.update(
            db, todo,
            {"status": TodoStatus.ACTIVE}
        )

    @staticmethod
    def get_stats(db, user_id: int) -> dict:
        status_counts = TodoRepository.count_by_status(db, user_id)
        completed_today = TodoRepository.get_completed_today(db, user_id)

        return {
            "total": sum(status_counts.values()),
            "by_status": status_counts,
            "completed_today": len(completed_today),
            "active": status_counts.get(TodoStatus.ACTIVE, 0),
            "snoozed": status_counts.get(TodoStatus.SNOOZED, 0),
            "parking_lot": status_counts.get(TodoStatus.PARKING_LOT, 0),
        }

    @staticmethod
    def reactivate_snoozed(db, user_id: int) -> list[Todo]:
        snoozed = TodoRepository.get_snoozed_todos(db, user_id)
        for todo in snoozed:
            todo.status = TodoStatus.ACTIVE
            todo.snoozed_until = None
            todo.done_for_day = False

        TodoRepository.bulk_update(db, snoozed)
        return snoozed

    @staticmethod
    def suggest_by_energy(db, user_id: int, hour: int | None = None) -> list[Todo]:
        if hour is None:
            hour = datetime.now().hour

        # Simple heuristic: morning = high energy, afternoon = medium, evening = low
        if 6 <= hour < 12:
            suggested_energy = EnergyLevel.HIGH
        elif 12 <= hour < 17:
            suggested_energy = EnergyLevel.MEDIUM
        else:
            suggested_energy = EnergyLevel.LOW

        active = TodoRepository.get_active_todos(db, user_id)
        matching = [t for t in active if t.energy_level == suggested_energy]

        # If not enough matching, include others
        if len(matching) < 3:
            other = [t for t in active if t.energy_level != suggested_energy]
            matching.extend(other[:3 - len(matching)])

        return matching
