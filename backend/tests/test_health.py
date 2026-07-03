import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_headers(client):
    response = client.post("/api/v1/auth/guest")
    assert response.status_code == 201
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_formats(client):
    response = client.get("/api/v1/formats")
    assert response.status_code == 200
    data = response.json()
    assert "formats" in data
    assert len(data["formats"]) >= 5


def test_guest_token(client):
    response = client.post("/api/v1/auth/guest")
    assert response.status_code == 201
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["expires_in"] > 0


def test_register_and_login(client):
    email = f"test-{uuid.uuid4().hex[:8]}@example.com"
    register = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "secret12", "name": "Test User"},
    )
    assert register.status_code == 201
    reg_body = register.json()
    assert reg_body["access_token"]
    assert reg_body["user"]["email"] == email

    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "secret12"},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]


def test_tasks_require_auth(client):
    response = client.get("/api/v1/tasks")
    assert response.status_code == 401


def test_tasks_with_guest_token(client, auth_headers):
    response = client.get("/api/v1/tasks", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["tasks"] == []
