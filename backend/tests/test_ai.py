from unittest.mock import patch

from todos.schemas import AITodoItem
from todos.models import EnergyLevel, Context


def _login_user(client):
    """Helper to register and login a user, returning the auth token."""
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def test_ai_plan_info_free_user(client):
    token = _login_user(client)
    response = client.get("/api/v1/ai/plan", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["plan"] == "free"
    assert data["ai_requests_limit"] == 5
    assert data["ai_requests_used"] == 0
    assert data["ai_requests_remaining"] == 5


def test_ai_generate_todos_free_user_quota(client):
    token = _login_user(client)

    mock_todo = AITodoItem(
        title="Test todo",
        description=None,
        energy_level=EnergyLevel.MEDIUM,
        context=Context.DESK,
        estimated_minutes=30,
    )

    with patch("ai.router.ai_service.generate_todos", return_value=[mock_todo]):
        # Exhaust the 5 daily requests
        for i in range(5):
            response = client.post(
                "/api/v1/ai/todos",
                json={"prompt": f"test prompt {i}"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200, f"Failed on request {i}: {response.json()}"

        # 6th request should be rate limited
        response = client.post(
            "/api/v1/ai/todos",
            json={"prompt": "test prompt 6"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 429
        assert "Daily AI request limit reached" in response.json()["detail"]


def test_ai_generate_todos_no_auth(client):
    response = client.post("/api/v1/ai/todos", json={"prompt": "test"})
    assert response.status_code == 401


def test_ai_plan_info_tracks_usage(client):
    token = _login_user(client)

    mock_todo = AITodoItem(
        title="Test",
        description=None,
        energy_level=EnergyLevel.LOW,
        context=Context.PHONE,
        estimated_minutes=10,
    )

    with patch("ai.router.ai_service.generate_todos", return_value=[mock_todo]):
        # Make 2 AI requests
        for _ in range(2):
            res = client.post(
                "/api/v1/ai/todos",
                json={"prompt": "test"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert res.status_code == 200

    # Check plan info reflects usage
    plan_res = client.get("/api/v1/ai/plan", headers={"Authorization": f"Bearer {token}"})
    assert plan_res.status_code == 200
    data = plan_res.json()
    assert data["ai_requests_used"] == 2
    assert data["ai_requests_remaining"] == 3
    assert data["ai_requests_limit"] == 5


def test_ai_generate_todos_no_api_key_configured(client):
    """When OpenAI key is not set, service should raise and endpoint returns 503."""
    token = _login_user(client)

    with patch("ai.router.ai_service.generate_todos", side_effect=RuntimeError("OpenAI API key is not configured")):
        response = client.post(
            "/api/v1/ai/todos",
            json={"prompt": "test"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 503
