from datetime import datetime, timedelta, UTC

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db_session
from middleware.decorators import require_auth, rate_limit
from todos.schemas import AITodoRequest, AITodoResponse, TodoCreateRequest
from todos.services import TodoService
from users.models import UserPlan, Users


ai_router = APIRouter()

# Daily AI request limits by plan
PLAN_LIMITS = {
    UserPlan.FREE: 5,
    UserPlan.MID: 100,
    UserPlan.MAX: 100,
}


from ai.services import TodoLLMService


ai_service = TodoLLMService()


def _get_or_reset_daily_quota(user: Users, db: Session) -> tuple[int, int]:
    """Return (used, limit) after handling daily reset."""
    now = datetime.now()  # naive datetime to match DB storage
    plan = user.plan if isinstance(user.plan, UserPlan) else UserPlan(user.plan)
    limit = PLAN_LIMITS.get(plan, 5)

    if user.ai_requests_reset_at:
        if now >= user.ai_requests_reset_at:
            user.ai_requests_used = 0
            user.ai_requests_reset_at = now + timedelta(days=1)
            db.commit()
    else:
        user.ai_requests_reset_at = now + timedelta(days=1)
        db.commit()

    return user.ai_requests_used, limit


@ai_router.post("/todos", response_model=AITodoResponse)
@require_auth
@rate_limit("5/minute")
def generate_todos(
    data: AITodoRequest,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    user_id = user["user_id"]
    user_data = db.query(Users).filter(Users.id == user_id).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    used, limit = _get_or_reset_daily_quota(user_data, db)

    if used >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Daily AI request limit reached ({limit}/day). Upgrade your plan for more requests.",
        )

    # Generate todos using OpenAI API
    generated = ai_service.generate_todos(data.prompt)

    # Increment usage
    user_data.ai_requests_used += 1
    db.commit()

    # Create todos directly
    created_count = 0
    for item in generated:
        try:
            TodoService.create_todo(
                db, user_id,
                TodoCreateRequest(
                    title=item.title,
                    description=item.description,
                    energy_level=item.energy_level,
                    context=item.context,
                    estimated_minutes=item.estimated_minutes,
                )
            )
            created_count += 1
        except Exception:
            # Skip if creation fails
            pass

    return AITodoResponse(
        todos=generated,
        created_count=created_count,
    )


@ai_router.get("/plan")
@require_auth
@rate_limit("60/minute")
def get_plan_info(
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    user_id = user["user_id"]
    user_data = db.query(Users).filter(Users.id == user_id).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    used, limit = _get_or_reset_daily_quota(user_data, db)
    remaining = max(0, limit - used)
    plan_value = user_data.plan.value if isinstance(user_data.plan, UserPlan) else user_data.plan

    return {
        "plan": plan_value,
        "ai_requests_used": used,
        "ai_requests_limit": limit,
        "ai_requests_remaining": remaining,
        "ai_requests_reset_at": user_data.ai_requests_reset_at,
    }
