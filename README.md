# Meridianly

A personal life management app for tracking daily habits, tasks, nutrition, and notes. Built with a clean, minimal UI and mobile-first design.

## Features

**Authentication**
- Secure register and login with JWT tokens
- Token refresh and session management

**Water Tracker**
- Daily hydration goal with visual progress
- Quick-add presets (150ml, 250ml, 330ml, 500ml)
- Intake history with delete support

**Todos**
- Create, edit, and organize tasks by energy level and context
- AI-powered todo generation (OpenAI integration)
- Focus timer for deep work sessions
- Snooze, archive, and parking lot for later
- Done-for-day mode to pause non-urgent tasks
- Daily stats and suggestions

**Notes**
- Quick-capture short notes with a Notion-style editor
- Pin important notes to the top
- Search across all notes
- Color tags for visual organization
- Markdown preview support

**Food Tracker**
- Log meals from 80+ built-in Indian food presets
- Add custom foods with full macro details
- Automatic calorie and macro calculation based on portion size
- Daily nutrition summary (calories, protein, carbs, fat)
- Food history with delete support

**AI Assistant**
- Generate todo lists from natural language prompts
- Daily usage quotas with automatic reset

**Design**
- Consistent sticky headers and minimal footer across all pages
- Dark and light mode toggle
- Responsive layout for mobile and desktop

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **Frontend:** Next.js 16, Tailwind CSS, shadcn/ui
- **AI:** OpenAI API
