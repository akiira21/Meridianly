from unittest.mock import patch

from food.schemas import FoodPresetCreateRequest, FoodLogCreateRequest


def _login_user(client):
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


def test_list_presets_requires_auth(client):
    response = client.get("/api/v1/food/presets")
    assert response.status_code == 401


def test_list_presets_returns_defaults(client):
    token = _login_user(client)
    response = client.get("/api/v1/food/presets", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 50  # Should have many system presets
    assert any(p["name"] == "White Rice (cooked)" for p in data["items"])
    assert any(p["is_system"] == True for p in data["items"])


def test_filter_presets_by_category(client):
    token = _login_user(client)
    response = client.get("/api/v1/food/presets?category=proteins", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert all(p["category"] == "proteins" for p in data["items"])


def test_create_custom_preset(client):
    token = _login_user(client)
    payload = {
        "name": "My Special Dish",
        "category": "custom",
        "calories_per_100g": 200,
        "protein_per_100g": 10,
        "carbs_per_100g": 25,
        "fat_per_100g": 8,
    }
    response = client.post("/api/v1/food/presets", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "My Special Dish"
    assert data["is_system"] == False
    assert data["user_id"] == 1


def test_delete_custom_preset(client):
    token = _login_user(client)
    # Create a preset first
    create_res = client.post(
        "/api/v1/food/presets",
        json={"name": "ToDelete", "category": "custom", "calories_per_100g": 100},
        headers={"Authorization": f"Bearer {token}"},
    )
    preset_id = create_res.json()["id"]

    # Delete it
    delete_res = client.delete(f"/api/v1/food/presets/{preset_id}", headers={"Authorization": f"Bearer {token}"})
    assert delete_res.status_code == 200

    # Verify it's gone
    list_res = client.get("/api/v1/food/presets", headers={"Authorization": f"Bearer {token}"})
    assert not any(p["id"] == preset_id for p in list_res.json()["items"])


def test_cannot_delete_system_preset(client):
    token = _login_user(client)
    # Get a system preset
    list_res = client.get("/api/v1/food/presets", headers={"Authorization": f"Bearer {token}"})
    system_preset = next(p for p in list_res.json()["items"] if p["is_system"])

    # Try to delete it
    delete_res = client.delete(f"/api/v1/food/presets/{system_preset['id']}", headers={"Authorization": f"Bearer {token}"})
    assert delete_res.status_code == 404


def test_log_food_with_preset(client):
    token = _login_user(client)
    # Get a preset
    list_res = client.get("/api/v1/food/presets", headers={"Authorization": f"Bearer {token}"})
    preset = list_res.json()["items"][0]

    # Log 200g of it
    payload = {
        "food_preset_id": preset["id"],
        "food_name": preset["name"],
        "amount_g": 200,
        "calories": preset["calories_per_100g"] * 2,
        "protein": preset["protein_per_100g"] * 2,
        "carbs": preset["carbs_per_100g"] * 2,
        "fat": preset["fat_per_100g"] * 2,
    }
    response = client.post("/api/v1/food/log", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["food_name"] == preset["name"]
    assert data["amount_g"] == 200


def test_log_custom_food(client):
    token = _login_user(client)
    payload = {
        "food_preset_id": None,
        "food_name": "Random Snack",
        "amount_g": 50,
        "calories": 150,
        "protein": 3,
        "carbs": 20,
        "fat": 6,
    }
    response = client.post("/api/v1/food/log", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["food_name"] == "Random Snack"
    assert data["amount_g"] == 50


def test_get_today_food_summary(client):
    token = _login_user(client)
    # Log two items
    client.post(
        "/api/v1/food/log",
        json={"food_name": "Food1", "amount_g": 100, "calories": 200, "protein": 5, "carbs": 30, "fat": 8},
        headers={"Authorization": f"Bearer {token}"},
    )
    client.post(
        "/api/v1/food/log",
        json={"food_name": "Food2", "amount_g": 100, "calories": 300, "protein": 10, "carbs": 40, "fat": 12},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Check today summary
    response = client.get("/api/v1/food/today", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_calories"] == 500
    assert data["summary"]["total_protein"] == 15
    assert data["summary"]["total_carbs"] == 70
    assert data["summary"]["total_fat"] == 20
    assert data["summary"]["entry_count"] == 2
    assert len(data["logs"]) == 2


def test_delete_food_log(client):
    token = _login_user(client)
    # Log an item
    log_res = client.post(
        "/api/v1/food/log",
        json={"food_name": "ToDelete", "amount_g": 100, "calories": 100},
        headers={"Authorization": f"Bearer {token}"},
    )
    log_id = log_res.json()["id"]

    # Delete it
    delete_res = client.delete(f"/api/v1/food/log/{log_id}", headers={"Authorization": f"Bearer {token}"})
    assert delete_res.status_code == 200

    # Verify it's gone from today
    today_res = client.get("/api/v1/food/today", headers={"Authorization": f"Bearer {token}"})
    assert not any(l["id"] == log_id for l in today_res.json()["logs"])


def test_food_history_pagination(client):
    token = _login_user(client)
    # Log 3 items
    for i in range(3):
        client.post(
            "/api/v1/food/log",
            json={"food_name": f"Food{i}", "amount_g": 100, "calories": 100},
            headers={"Authorization": f"Bearer {token}"},
        )

    response = client.get("/api/v1/food/history?limit=2&offset=0", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 3
