from sqlalchemy.orm import Session
from sqlalchemy import select, and_, desc
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from todos.models import Todo, TodoStatus


class TodoRepository:
    @staticmethod
    def create(db: Session, data: dict) -> Todo:
        try:
            todo = Todo(**data)
            db.add(todo)
            db.commit()
            db.refresh(todo)
            return todo
        except IntegrityError:
            db.rollback()
            raise
        except SQLAlchemyError:
            db.rollback()
            raise

    @staticmethod
    def get_by_id(db: Session, todo_id: int, user_id: int) -> Todo | None:
        return db.execute(
            select(Todo).where(
                and_(Todo.id == todo_id, Todo.user_id == user_id)
            )
        ).scalar_one_or_none()

    @staticmethod
    def get_all(
        db: Session,
        user_id: int,
        status: TodoStatus | None = None,
        energy_level: str | None = None,
        context: str | None = None,
        done_for_day: bool | None = None,
    ) -> list[Todo]:
        query = select(Todo).where(Todo.user_id == user_id)

        if status:
            query = query.where(Todo.status == status)
        if energy_level:
            query = query.where(Todo.energy_level == energy_level)
        if context:
            query = query.where(Todo.context == context)
        if done_for_day is not None:
            query = query.where(Todo.done_for_day == done_for_day)

        query = query.order_by(desc(Todo.created_at))
        result = db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def update(db: Session, todo: Todo, data: dict) -> Todo:
        try:
            for key, value in data.items():
                if value is not None:
                    setattr(todo, key, value)
            db.commit()
            db.refresh(todo)
            return todo
        except SQLAlchemyError:
            db.rollback()
            raise

    @staticmethod
    def delete(db: Session, todo: Todo) -> bool:
        try:
            db.delete(todo)
            db.commit()
            return True
        except SQLAlchemyError:
            db.rollback()
            return False

    @staticmethod
    def get_active_todos(db: Session, user_id: int) -> list[Todo]:
        query = select(Todo).where(
            and_(
                Todo.user_id == user_id,
                Todo.status == TodoStatus.ACTIVE,
                Todo.done_for_day == False,
            )
        ).order_by(desc(Todo.created_at))
        result = db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def get_snoozed_todos(db: Session, user_id: int) -> list[Todo]:
        from datetime import datetime
        query = select(Todo).where(
            and_(
                Todo.user_id == user_id,
                Todo.status == TodoStatus.SNOOZED,
                Todo.snoozed_until <= datetime.now(),
            )
        )
        result = db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def get_parking_lot(db: Session, user_id: int) -> list[Todo]:
        query = select(Todo).where(
            and_(
                Todo.user_id == user_id,
                Todo.status == TodoStatus.PARKING_LOT,
            )
        ).order_by(desc(Todo.created_at))
        result = db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def get_completed_today(db: Session, user_id: int) -> list[Todo]:
        from datetime import datetime, timedelta
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        query = select(Todo).where(
            and_(
                Todo.user_id == user_id,
                Todo.status == TodoStatus.COMPLETED,
                Todo.completed_at >= today_start,
                Todo.completed_at < today_end,
            )
        )
        result = db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def bulk_update(db: Session, todos: list[Todo]) -> bool:
        try:
            for todo in todos:
                db.merge(todo)
            db.commit()
            return True
        except SQLAlchemyError:
            db.rollback()
            return False

    @staticmethod
    def count_by_status(db: Session, user_id: int) -> dict:
        from sqlalchemy import func
        query = (
            select(Todo.status, func.count(Todo.id))
            .where(Todo.user_id == user_id)
            .group_by(Todo.status)
        )
        result = db.execute(query)
        return {row[0]: row[1] for row in result.all()}
