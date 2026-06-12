from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db_session
from todos.models import EnergyLevel, Context, TodoStatus
from todos.schemas import AITodoRequest, AITodoResponse, AITodoItem, TodoCreateRequest
from todos.services import TodoService
from users.repository import UserRepository
from users.models import UserPlan
from limiter import limiter


ai_router = APIRouter()


# Plan-based rate limits
PLAN_LIMITS = {
    UserPlan.FREE: 25,
    UserPlan.MID: 100,
    UserPlan.MAX: 500,
}


class SimpleTodoAI:
    """Mock AI assistant that parses natural language and generates structured todos.
    In production, this would be replaced with an LLM API call (OpenAI, Claude, etc.).
    """

    @staticmethod
    def generate_todos(prompt: str) -> list[AITodoItem]:
        prompt_lower = prompt.lower()
        todos = []

        # Simple keyword-based generation for demo
        keywords = {
            "homework": ("high", "desk", 60),
            "study": ("high", "desk", 90),
            "meeting": ("medium", "desk", 30),
            "call": ("medium", "phone", 15),
            "groceries": ("low", "errands", 30),
            "shop": ("low", "errands", 45),
            "walk": ("low", "errands", 20),
            "clean": ("low", "desk", 30),
            "cook": ("medium", "desk", 45),
            "read": ("medium", "desk", 30),
            "email": ("low", "phone", 10),
            "exercise": ("high", "errands", 45),
            "meditate": ("low", "desk", 10),
            "code": ("high", "desk", 120),
            "write": ("high", "desk", 60),
            "design": ("high", "desk", 90),
            "present": ("high", "desk", 45),
            "review": ("medium", "desk", 30),
            "plan": ("medium", "desk", 20),
            "organize": ("low", "desk", 25),
            "relax": ("low", "desk", 30),
            "sleep": ("low", "desk", 480),
            "nap": ("low", "desk", 30),
        }

        # Split by common separators
        tasks = [t.strip() for t in prompt_lower.replace(",", "|").replace("and", "|").replace(";", "|").split("|")]
        tasks = [t for t in tasks if t and len(t) > 2]

        for task in tasks:
            best_energy = "medium"
            best_context = "any"
            best_minutes = 30

            for keyword, (energy, context, minutes) in keywords.items():
                if keyword in task:
                    best_energy = energy
                    best_context = context
                    best_minutes = minutes
                    break

            # Clean up the task title
            prefixes = [
                "need to", "i need to", "i have to", "i should",
                "to ", "finish my", "prepare for", "buy", "do", "get",
                "make", "take", "go",
            ]
            title = task.strip()
            for prefix in prefixes:
                if title.startswith(prefix):
                    title = title[len(prefix):].strip()
                    break

            title = title.strip().capitalize()
            if not title:
                continue

            todos.append(AITodoItem(
                title=title,
                description=None,
                energy_level=EnergyLevel(best_energy),
                context=Context(best_context),
                estimated_minutes=best_minutes,
            ))

        if not todos:
            # Fallback: create a single todo from the whole prompt
            todos.append(AITodoItem(
                title=prompt[:50].strip().capitalize(),
                description=prompt,
                energy_level=EnergyLevel.MEDIUM,
                context=Context.ANY,
                estimated_minutes=30,
            ))

        return todos


@ai_router.post("/todos", response_model=AITodoResponse)
@limiter.limit("5/minute")
def generate_todos(
    request: AITodoRequest,
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
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

    # Generate todos
    generated = SimpleTodoAI.generate_todos(request.prompt)

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
def get_plan_info(
    db: Session = Depends(get_db_session),
    user=Depends(get_current_user),
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
