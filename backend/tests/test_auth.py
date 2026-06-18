def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "ok"


def test_register_success(client):
    payload = {
        "username": "johndoe",
        "email": "john@example.com",
        "password": "password123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "johndoe"
    assert data["email"] == "john@example.com"


def test_register_duplicate_email(client):
    payload = {
        "username": "johndoe",
        "email": "john@example.com",
        "password": "password123",
    }
    client.post("/api/v1/auth/register", json=payload)

    # Try registering again with same email
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "User already exists"


def test_login_success(client):
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={"username": "johndoe", "email": "john@example.com", "password": "password123"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "john@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "Bearer"
    assert "user_id" in data


def test_login_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "johndoe", "email": "john@example.com", "password": "password123"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "john@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_invalid_email_format(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "not-an-email", "password": "password123"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid email format"


def test_refresh_token(client):
    # Register and login
    client.post(
        "/api/v1/auth/register",
        json={"username": "johndoe", "email": "john@example.com", "password": "password123"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@example.com", "password": "password123"},
    )
    assert login_res.status_code == 200

    # Use refresh token cookie to refresh
    refresh_res = client.post("/api/v1/auth/refresh")
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "access_token" in data


def test_refresh_without_cookie(client):
    response = client.post("/api/v1/auth/refresh")
    assert response.status_code == 401
    assert response.json()["detail"] == "Missing refresh token"


def test_logout(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "johndoe", "email": "john@example.com", "password": "password123"},
    )
    client.post(
        "/api/v1/auth/login",
        json={"email": "john@example.com", "password": "password123"},
    )

    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"
