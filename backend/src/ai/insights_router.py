from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db_session
from middleware.decorators import require_auth, rate_limit
from ai.insights import DailyInsightService
from ai.schemas import AIInsightResponse, AIInsightResponseItem
from ai.models import AIInsight
from users.models import Users


insights_router = APIRouter()
insight_service = DailyInsightService()


@insights_router.get("/insights", response_model=AIInsightResponse)
@require_auth
@rate_limit("30/minute")
def get_insights(
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    user_id = user["user_id"]
    user_data = db.query(Users).filter(Users.id == user_id).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    if not user_data.ai_insights_enabled:
        return AIInsightResponse(insights=[], generated_at=None)

    items = insight_service.get_or_generate_today_insights(db, user_id)

    insights = []
    generated_at = None
    for item in items:
        content = item.content
        insights.append(
            AIInsightResponseItem(
                id=item.id,
                insight_type=item.insight_type,
                title=content.get("title", ""),
                message=content.get("message", ""),
                tips=content.get("tips", []),
                generated_at=item.generated_at,
                is_read=item.is_read,
            )
        )
        if generated_at is None:
            generated_at = item.generated_at

    return AIInsightResponse(
        insights=insights,
        generated_at=generated_at,
    )


@insights_router.patch("/insights/{insight_id}/read")
@require_auth
@rate_limit("60/minute")
def mark_insight_read(
    insight_id: int,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    success = insight_service.mark_read(db, insight_id, user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Insight not found")
    return {"message": "Insight marked as read"}
