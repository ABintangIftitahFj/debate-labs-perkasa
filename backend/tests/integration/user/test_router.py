import pytest
from httpx import AsyncClient


def _register_payload(**overrides) -> dict:
    defaults = dict(
        username="alice",
        email="alice@example.com",
        password="secret123",
        full_name="Alice Wonderland",
        role="student",
    )
    defaults.update(overrides)
    return defaults


# ── POST /v1/users/register ─────────────────────────────


@pytest.mark.asyncio
async def test_register_returns_tokens(client: AsyncClient):
    res = await client.post("/v1/users/register", json=_register_payload())
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email_409(client: AsyncClient):
    await client.post("/v1/users/register", json=_register_payload())
    res = await client.post(
        "/v1/users/register",
        json=_register_payload(username="other", email="alice@example.com"),
    )
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_register_duplicate_username_409(client: AsyncClient):
    await client.post("/v1/users/register", json=_register_payload())
    res = await client.post(
        "/v1/users/register",
        json=_register_payload(email="other@example.com"),
    )
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_register_admin_forbidden_403(client: AsyncClient):
    res = await client.post(
        "/v1/users/register",
        json=_register_payload(username="root", email="root@example.com", role="admin"),
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_register_invalid_email_422(client: AsyncClient):
    res = await client.post(
        "/v1/users/register",
        json=_register_payload(email="not-an-email"),
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_register_missing_fields_422(client: AsyncClient):
    res = await client.post("/v1/users/register", json={})
    assert res.status_code == 422


# ── POST /v1/users/login ────────────────────────────────


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post("/v1/users/register", json=_register_payload())
    res = await client.post(
        "/v1/users/login",
        json={"email": "alice@example.com", "password": "secret123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password_401(client: AsyncClient):
    await client.post("/v1/users/register", json=_register_payload())
    res = await client.post(
        "/v1/users/login",
        json={"email": "alice@example.com", "password": "wrongpassword"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_email_401(client: AsyncClient):
    res = await client.post(
        "/v1/users/login",
        json={"email": "nobody@example.com", "password": "secret123"},
    )
    assert res.status_code == 401


# ── POST /v1/users/refresh ──────────────────────────────


@pytest.mark.asyncio
async def test_refresh_returns_new_tokens(client: AsyncClient):
    reg = await client.post("/v1/users/register", json=_register_payload())
    refresh_token = reg.json()["refresh_token"]

    res = await client.post("/v1/users/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["refresh_token"] != refresh_token


@pytest.mark.asyncio
async def test_refresh_invalid_token_401(client: AsyncClient):
    res = await client.post("/v1/users/refresh", json={"refresh_token": "garbage"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_refresh_reuse_old_token_401(client: AsyncClient):
    reg = await client.post("/v1/users/register", json=_register_payload())
    old_token = reg.json()["refresh_token"]

    await client.post("/v1/users/refresh", json={"refresh_token": old_token})
    res = await client.post("/v1/users/refresh", json={"refresh_token": old_token})
    assert res.status_code == 401


# ── POST /v1/users/logout ───────────────────────────────


@pytest.mark.asyncio
async def test_logout_success(client: AsyncClient):
    reg = await client.post("/v1/users/register", json=_register_payload())
    refresh_token = reg.json()["refresh_token"]

    res = await client.post("/v1/users/logout", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    assert res.json()["message"] == "Logged out"


@pytest.mark.asyncio
async def test_logout_then_refresh_fails(client: AsyncClient):
    reg = await client.post("/v1/users/register", json=_register_payload())
    refresh_token = reg.json()["refresh_token"]

    await client.post("/v1/users/logout", json={"refresh_token": refresh_token})
    res = await client.post("/v1/users/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 401


# ── GET /v1/users/me ────────────────────────────────────


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    reg = await client.post("/v1/users/register", json=_register_payload())
    access_token = reg.json()["access_token"]

    res = await client.get(
        "/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert data["role"] == "student"


@pytest.mark.asyncio
async def test_get_me_no_token_401(client: AsyncClient):
    res = await client.get("/v1/users/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_me_invalid_token_401(client: AsyncClient):
    res = await client.get(
        "/v1/users/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert res.status_code == 401


# ── PATCH /v1/users/me ──────────────────────────────────


@pytest.mark.asyncio
async def test_update_me_full_name(client: AsyncClient):
    reg = await client.post("/v1/users/register", json=_register_payload())
    access_token = reg.json()["access_token"]

    res = await client.patch(
        "/v1/users/me",
        json={"full_name": "Alice Updated"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res.status_code == 200
    assert res.json()["full_name"] == "Alice Updated"


@pytest.mark.asyncio
async def test_update_me_student_profile(client: AsyncClient):
    reg = await client.post("/v1/users/register", json=_register_payload())
    access_token = reg.json()["access_token"]

    res = await client.patch(
        "/v1/users/me",
        json={"student_profile": {"school_name": "SMAN 1 Jakarta", "grade_level": "12"}},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["student_profile"]["school_name"] == "SMAN 1 Jakarta"
    assert data["student_profile"]["grade_level"] == "12"


@pytest.mark.asyncio
async def test_update_me_no_token_401(client: AsyncClient):
    res = await client.patch("/v1/users/me", json={"full_name": "Hacker"})
    assert res.status_code == 401
