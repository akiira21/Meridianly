from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db_session
from middleware.decorators import require_auth, require_plan, rate_limit
from todos.models import EnergyLevel, Context, TodoStatus
from todos.schemas import AITodoRequest, AITodoResponse, AITodoItem, TodoCreateRequest
from todos.services import TodoService
from users.repository import UserRepository
from users.models import UserPlan


ai_router = APIRouter()


# Plan-based rate limits
PLAN_LIMITS = {
    UserPlan.FREE: 25,
    UserPlan.MID: 100,
    UserPlan.MAX: 500,
}


from ai.services import TodoLLMService


ai_service = TodoLLMService()


@ai_router.post("/todos", response_model=AITodoResponse)
@require_auth
@rate_limit("5/minute")
def generate_todos(
    data: AITodoRequest,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    user_id = user["user_id"]
    user_data = UserRepository.get_by_id(db, user_id)

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Check monthly reset
    from datetime import datetime, timedelta
    now = datetime.now()
    if user_data.ai_requests_reset_at and now > user_data.ai_requests_reset_at:
        user_data.ai_requests_used = 0
        user_data.ai_requests_reset_at = now + timedelta(days=30)
        db.commit()

    # Check rate limit
    plan = user_data.plan or UserPlan.FREE
    limit = PLAN_LIMITS.get(plan, 25)

    if user_data.ai_requests_used >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"AI request limit reached for {plan.value} plan. Limit: {limit}/month",
        )

    # Generate todos using LLM (with fallback)
    generated = ai_service.generate_todos(data.prompt)

    # Increment usage
    user_data.ai_requests_used += 1
    if not user_data.ai_requests_reset_at:
        user_data.ai_requests_reset_at = now + timedelta(days=30)
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
    user_data = UserRepository.get_by_id(db, user_id)

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    plan = user_data.plan or UserPlan.FREE
    limit = PLAN_LIMITS.get(plan, 25)
    used = user_data.ai_requests_used or 0
    remaining = max(0, limit - used)

    return {
        "plan": plan.value,
        "ai_requests_used": used,
        "ai_requests_limit": limit,
        "ai_requests_remaining": remaining,
        "ai_requests_reset_at": user_data.ai_requests_reset_at,
    }
