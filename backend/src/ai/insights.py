import json
import logging
from datetime import datetime, timedelta
from typing import Any

from openai import OpenAI
from sqlalchemy.orm import Session
from sqlalchemy import func

from config import Config
from ai.models import AIInsight
from food.models import FoodLog
from water.models import WaterIntake
from todos.models import Todo
from notes.models import Note

logger = logging.getLogger(__name__)


class DailyInsightService:
    """AI companion that generates morning, noon, and night insights based on user's last 3 days of data."""

    SYSTEM_PROMPT = """You are a thoughtful Indian health and wellness companion. Based on the user's last 3 days of activity (food, water, todos, notes), generate personalized insights for morning, noon, and night.

For each time period, provide:
- title: A warm, encouraging heading (max 60 chars)
- message: A personalized paragraph with advice, targets, or reflections (max 300 chars)
- tips: 2-3 short actionable bullet points (max 80 chars each)

Morning (8 AM): Set the tone for the day. Suggest daily targets based on patterns. Mention hydration and breakfast ideas. Encourage completing todos.
Noon (12:30 PM): Mid-day check-in. Suggest what to eat/drink. Warn about heavy fats if previous days were high fat. Encourage water intake and remaining todos.
Night (8 PM): End-of-day reflection. Celebrate completed todos. Suggest light dinner. Give a gentle nutrition summary and tomorrow's tip.

Rules:
- Be warm, supportive, and culturally aware (Indian diet context).
- Reference actual data patterns (e.g., "You averaged 1800 kcal", "You completed 5/7 todos").
- If water intake was low, remind to drink more.
- If protein was low, suggest dal, paneer, eggs.
- If user had too many fried snacks, gently suggest healthier alternatives.
- Keep tone friendly, never judgmental.

Return ONLY valid JSON in this exact format:
{
  "morning": {
    "title": "...",
    "message": "...",
    "tips": ["...", "..."]
  },
  "noon": {
    "title": "...",
    "message": "...",
    "tips": ["...", "..."]
  },
  "night": {
    "title": "...",
    "message": "...",
    "tips": ["...", "..."]
  }
}
"""

    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY) if Config.OPENAI_API_KEY else None

    def _build_context(self, db: Session, user_id: int) -> str:
        """Fetch last 3 days of user data and format as context string."""
        end = datetime.now()
        start = end - timedelta(days=3)

        # Food logs
        food_logs = db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_at >= start,
            FoodLog.logged_at <= end,
        ).order_by(FoodLog.logged_at.desc()).all()

        food_summary = {}
        daily_food = {}
        for log in food_logs:
            day = log.logged_at.strftime("%Y-%m-%d")
            if day not in daily_food:
                daily_food[day] = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "entries": []}
            daily_food[day]["calories"] += log.calculated_calories
            daily_food[day]["protein"] += log.calculated_protein
            daily_food[day]["carbs"] += log.calculated_carbs
            daily_food[day]["fat"] += log.calculated_fat
            daily_food[day]["entries"].append(log.food_name)

        avg_calories = sum(d["calories"] for d in daily_food.values()) / max(len(daily_food), 1)
        avg_protein = sum(d["protein"] for d in daily_food.values()) / max(len(daily_food), 1)
        avg_water = 0

        # Water intakes
        water_logs = db.query(WaterIntake).filter(
            WaterIntake.user_id == user_id,
            WaterIntake.logged_at >= start,
            WaterIntake.logged_at <= end,
        ).all()
        daily_water = {}
        for w in water_logs:
            day = w.logged_at.strftime("%Y-%m-%d")
            daily_water[day] = daily_water.get(day, 0) + w.amount_ml
        avg_water = sum(daily_water.values()) / max(len(daily_water), 1)

        # Todos
        todos = db.query(Todo).filter(
            Todo.user_id == user_id,
            Todo.created_at >= start,
        ).all()
        total_todos = len(todos)
        completed_todos = sum(1 for t in todos if t.status == "completed")
        pending_todos = sum(1 for t in todos if t.status == "active")

        # Notes (just count and recent titles)
        notes = db.query(Note).filter(
            Note.user_id == user_id,
            Note.created_at >= start,
        ).order_by(Note.created_at.desc()).limit(5).all()
        note_titles = [n.title for n in notes]

        context_lines = [
            "=== USER CONTEXT (Last 3 Days) ===",
            f"Days with food logs: {len(daily_food)}",
            f"Average daily calories: {avg_calories:.0f} kcal",
            f"Average daily protein: {avg_protein:.1f}g",
            f"Average daily water: {avg_water:.0f}ml",
            f"Todos created: {total_todos}, Completed: {completed_todos}, Active: {pending_todos}",
        ]

        if daily_food:
            context_lines.append("Daily food breakdown:")
            for day, data in sorted(daily_food.items()):
                context_lines.append(f"  {day}: {data['calories']:.0f} kcal, P:{data['protein']:.1f}g, foods: {', '.join(data['entries'][:5])}")

        if daily_water:
            context_lines.append("Daily water breakdown:")
            for day, ml in sorted(daily_water.items()):
                context_lines.append(f"  {day}: {ml}ml")

        if note_titles:
            context_lines.append(f"Recent notes: {', '.join(note_titles)}")

        return "\n".join(context_lines)

    def generate_insights(self, db: Session, user_id: int) -> dict[str, Any] | None:
        """Generate daily insights using OpenAI. Returns dict with morning/noon/night or None."""
        if not self.client:
            logger.warning("OpenAI API key not configured, skipping insight generation")
            return None

        context = self._build_context(db, user_id)

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": context},
                ],
                temperature=0.6,
                max_tokens=1200,
            )

            content = response.choices[0].message.content
            data = json.loads(content)

            # Validate structure
            result = {}
            for period in ("morning", "noon", "night"):
                item = data.get(period, {})
                result[period] = {
                    "title": str(item.get("title", ""))[:60],
                    "message": str(item.get("message", ""))[:300],
                    "tips": [str(t)[:80] for t in item.get("tips", [])[:3]],
                }
            return result

        except Exception as exc:
            logger.error(f"OpenAI insight generation error: {exc}")
            return None

    def get_or_generate_today_insights(self, db: Session, user_id: int) -> list[AIInsight]:
        """Get today's insights. If none exist, generate and store them."""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)

        existing = db.query(AIInsight).filter(
            AIInsight.user_id == user_id,
            AIInsight.generated_at >= today,
            AIInsight.generated_at < tomorrow,
        ).all()

        if existing:
            return existing

        generated = self.generate_insights(db, user_id)
        if not generated:
            return []

        insights = []
        for period in ("morning", "noon", "night"):
            content = generated[period]
            insight = AIInsight(
                user_id=user_id,
                insight_type=period,
                content=content,
            )
            db.add(insight)
            insights.append(insight)

        db.commit()
        for i in insights:
            db.refresh(i)

        return insights

    def mark_read(self, db: Session, insight_id: int, user_id: int) -> bool:
        insight = db.query(AIInsight).filter(
            AIInsight.id == insight_id,
            AIInsight.user_id == user_id,
        ).first()
        if not insight:
            return False
        insight.is_read = True
        db.commit()
        return True
