import json
import logging
from typing import List

from openai import OpenAI

from config import Config
from todos.models import EnergyLevel, Context
from todos.schemas import AITodoItem

logger = logging.getLogger(__name__)


class TodoLLMService:
    """AI assistant using OpenAI API to generate structured todos from natural language."""

    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY) if Config.OPENAI_API_KEY else None
        self.system_prompt = """You are a helpful todo assistant. Given a user's natural language prompt, extract tasks and return them as structured JSON.

For each task, assign:
- title: A concise, clear task title (max 60 chars)
- description: Optional longer description or null
- energy_level: One of "low", "medium", "high" based on task complexity
- context: One of "desk", "phone", "errands", "quick", "any" based on where it can be done
- estimated_minutes: A realistic estimate in minutes (5-240)

Rules:
- If user says "homework" or "study" -> energy_level: "high", context: "desk", estimated_minutes: 60
- If user says "meeting" or "call" -> energy_level: "medium", context: "desk" or "phone", estimated_minutes: 30
- If user says "groceries" or "shop" -> energy_level: "low", context: "errands", estimated_minutes: 30
- If user says "walk" or "exercise" -> energy_level: "low", context: "errands", estimated_minutes: 20-45
- If user says "email" or "quick" -> energy_level: "low", context: "phone", estimated_minutes: 10
- If user says "clean" or "organize" -> energy_level: "low", context: "desk", estimated_minutes: 30
- If user says "cook" or "read" -> energy_level: "medium", context: "desk", estimated_minutes: 45
- If user says "code" or "design" or "write" -> energy_level: "high", context: "desk", estimated_minutes: 60-120
- If user says "relax" or "meditate" or "nap" -> energy_level: "low", context: "desk", estimated_minutes: 10-30

Return ONLY valid JSON in this exact format:
{
  "todos": [
    {
      "title": "...",
      "description": "...",
      "energy_level": "low|medium|high",
      "context": "desk|phone|errands|quick|any",
      "estimated_minutes": 30
    }
  ]
}
"""

    def generate_todos(self, prompt: str) -> List[AITodoItem]:
        """Generate todos using OpenAI API. Raises if API key is not configured."""
        if not self.client:
            raise RuntimeError("OpenAI API key is not configured")

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": f"Create todos from: {prompt}"},
                ],
                temperature=0.3,
                max_tokens=800,
            )

            content = response.choices[0].message.content
            # Parse JSON response
            data = json.loads(content)
            todos = data.get("todos", [])

            if not todos:
                # Fallback if LLM returns empty list
                return self._keyword_fallback(prompt)

            result = []
            for item in todos:
                try:
                    result.append(
                        AITodoItem(
                            title=item["title"],
                            description=item.get("description"),
                            energy_level=EnergyLevel(item.get("energy_level", "medium")),
                            context=Context(item.get("context", "any")),
                            estimated_minutes=item.get("estimated_minutes", 30),
                        )
                    )
                except (ValueError, KeyError):
                    # Skip invalid items
                    continue

            if not result:
                return self._keyword_fallback(prompt)

            return result

        except Exception as exc:
            logger.error(f"OpenAI API error: {exc}")
            # Fallback to keyword-based on any error
            return self._keyword_fallback(prompt)

    def _keyword_fallback(self, prompt: str) -> List[AITodoItem]:
        """Fallback keyword-based todo generation."""
        prompt_lower = prompt.lower()
        todos = []

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

            todos.append(
                AITodoItem(
                    title=title,
                    description=None,
                    energy_level=EnergyLevel(best_energy),
                    context=Context(best_context),
                    estimated_minutes=best_minutes,
                )
            )

        if not todos:
            todos.append(
                AITodoItem(
                    title=prompt[:50].strip().capitalize(),
                    description=prompt,
                    energy_level=EnergyLevel.MEDIUM,
                    context=Context.ANY,
                    estimated_minutes=30,
                )
            )

        return todos
