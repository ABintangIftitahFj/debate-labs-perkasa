from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import ConflictError, ForbiddenError, NotFoundError, UnauthorizedError
from src.core.security import create_refresh_token, hash_password
from src.modules.user.repository import AuthSession, User, UserRole
from src.modules.user.schemas import UserCreate, UserUpdate
from src.modules.user.service import UserService


# ── helpers ─────────────────────────────────────────────

def _student_create(**overrides) -> UserCreate:
    defaults = dict(
        username="alice",
        email="alice@example.com",
        password="secret123",
        full_name="Alice Wonderland",
        role=UserRole.STUDENT,
    )
    defaults.update(overrides)
    return UserCreate(**defaults)


def _coach_create(**overrides) -> UserCreate:
    defaults = dict(
        username="bob",
        email="bob@example.com",
        password="secret456",
        full_name="Bob Builder",
        role=UserRole.COACH,
    )
    defaults.update(overrides)
    return UserCreate(**defaults)


# ── CRUD: create ────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_student(db_session: AsyncSession):
    svc = UserService(db_session)
    data = _student_create()
    user = await svc.create(data)

    assert user.id is not None
    assert user.username == "alice"
    assert user.email == "alice@example.com"
    assert user.role == UserRole.STUDENT
    assert user.student_profile is None  # no profile data provided


@pytest.mark.asyncio
async def test_create_coach(db_session: AsyncSession):
    svc = UserService(db_session)
    data = _coach_create()
    user = await svc.create(data)

    assert user.id is not None
    assert user.role == UserRole.COACH
    assert user.coach_profile is None  # no profile data provided


@pytest.mark.asyncio
async def test_create_duplicate_email_raises(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.create(_student_create())

    with pytest.raises(ConflictError):
        await svc.create(_student_create(username="other", email="alice@example.com"))


@pytest.mark.asyncio
async def test_create_duplicate_username_raises(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.create(_student_create())

    with pytest.raises(ConflictError):
        await svc.create(_student_create(email="other@example.com"))


# ── CRUD: getters ───────────────────────────────────────


@pytest.mark.asyncio
async def test_get_by_id_found(db_session: AsyncSession):
    svc = UserService(db_session)
    created = await svc.create(_student_create())
    found = await svc.get_by_id(created.id)

    assert found.id == created.id
    assert found.username == "alice"


@pytest.mark.asyncio
async def test_get_by_id_not_found(db_session: AsyncSession):
    svc = UserService(db_session)
    with pytest.raises(NotFoundError):
        await svc.get_by_id(9999)


@pytest.mark.asyncio
async def test_get_by_email_found(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.create(_student_create())
    found = await svc.get_by_email("alice@example.com")

    assert found is not None
    assert found.username == "alice"


@pytest.mark.asyncio
async def test_get_by_email_returns_none(db_session: AsyncSession):
    svc = UserService(db_session)
    found = await svc.get_by_email("nobody@example.com")
    assert found is None


@pytest.mark.asyncio
async def test_get_by_username_found(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.create(_student_create())
    found = await svc.get_by_username("alice")

    assert found is not None
    assert found.email == "alice@example.com"


@pytest.mark.asyncio
async def test_get_by_username_returns_none(db_session: AsyncSession):
    svc = UserService(db_session)
    found = await svc.get_by_username("ghost")
    assert found is None


# ── CRUD: update ────────────────────────────────────────


@pytest.mark.asyncio
async def test_update_full_name(db_session: AsyncSession):
    svc = UserService(db_session)
    user = await svc.create(_student_create())

    updated = await svc.update(user.id, UserUpdate(full_name="Alice Updated"))
    assert updated.full_name == "Alice Updated"


@pytest.mark.asyncio
async def test_update_student_profile(db_session: AsyncSession):
    svc = UserService(db_session)
    user = await svc.create(_student_create())

    from src.modules.user.schemas import StudentProfileSchema

    updated = await svc.update(
        user.id,
        UserUpdate(student_profile=StudentProfileSchema(school_name="SMAN 1 Jakarta", grade_level="12")),
    )
    assert updated.student_profile is not None
    assert updated.student_profile.school_name == "SMAN 1 Jakarta"
    assert updated.student_profile.grade_level == "12"


@pytest.mark.asyncio
async def test_update_coach_profile(db_session: AsyncSession):
    svc = UserService(db_session)
    user = await svc.create(_coach_create())

    from src.modules.user.schemas import CoachProfileSchema

    updated = await svc.update(
        user.id,
        UserUpdate(coach_profile=CoachProfileSchema(institution="UI", subjects="Logika", years_of_experience=5)),
    )
    assert updated.coach_profile is not None
    assert updated.coach_profile.institution == "UI"
    assert updated.coach_profile.years_of_experience == 5


# ── Auth: register ──────────────────────────────────────


@pytest.mark.asyncio
async def test_register_student(db_session: AsyncSession):
    svc = UserService(db_session)
    tokens = await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_coach(db_session: AsyncSession):
    svc = UserService(db_session)
    tokens = await svc.register("bob", "bob@example.com", "secret456", "Bob", UserRole.COACH)

    assert "access_token" in tokens
    assert "refresh_token" in tokens


@pytest.mark.asyncio
async def test_register_admin_forbidden(db_session: AsyncSession):
    svc = UserService(db_session)
    with pytest.raises(ForbiddenError):
        await svc.register("root", "root@example.com", "secret", "Root", UserRole.ADMIN)


@pytest.mark.asyncio
async def test_register_duplicate_email_raises(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    with pytest.raises(ConflictError):
        await svc.register("alice2", "alice@example.com", "secret456", "Alice 2", UserRole.STUDENT)


@pytest.mark.asyncio
async def test_register_duplicate_username_raises(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    with pytest.raises(ConflictError):
        await svc.register("alice", "other@example.com", "secret456", "Alice Copy", UserRole.STUDENT)


# ── Auth: login ─────────────────────────────────────────


@pytest.mark.asyncio
async def test_login_success(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    tokens = await svc.login("alice@example.com", "secret123")
    assert "access_token" in tokens
    assert "refresh_token" in tokens


@pytest.mark.asyncio
async def test_login_wrong_password(db_session: AsyncSession):
    svc = UserService(db_session)
    await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    with pytest.raises(UnauthorizedError):
        await svc.login("alice@example.com", "wrongpassword")


@pytest.mark.asyncio
async def test_login_nonexistent_email(db_session: AsyncSession):
    svc = UserService(db_session)
    with pytest.raises(UnauthorizedError):
        await svc.login("nobody@example.com", "secret123")


# ── Auth: refresh ───────────────────────────────────────


@pytest.mark.asyncio
async def test_refresh_success(db_session: AsyncSession):
    svc = UserService(db_session)
    tokens = await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    new_tokens = await svc.refresh(tokens["refresh_token"])
    assert "access_token" in new_tokens
    assert new_tokens["refresh_token"] != tokens["refresh_token"]


@pytest.mark.asyncio
async def test_refresh_invalid_token(db_session: AsyncSession):
    svc = UserService(db_session)
    with pytest.raises(HTTPException) as exc_info:
        await svc.refresh("garbage.token.value")
    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_refresh_expired_session(db_session: AsyncSession):
    svc = UserService(db_session)
    tokens = await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    # Manually expire the session in the DB
    from sqlalchemy import update

    await db_session.execute(
        update(AuthSession)
        .where(AuthSession.token == tokens["refresh_token"])
        .values(expires_at=datetime.now(timezone.utc) - timedelta(days=1))
    )
    await db_session.commit()

    with pytest.raises(UnauthorizedError):
        await svc.refresh(tokens["refresh_token"])


@pytest.mark.asyncio
async def test_refresh_reuses_old_token_fails(db_session: AsyncSession):
    svc = UserService(db_session)
    tokens = await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    await svc.refresh(tokens["refresh_token"])

    with pytest.raises(UnauthorizedError):
        await svc.refresh(tokens["refresh_token"])


# ── Auth: logout ────────────────────────────────────────


@pytest.mark.asyncio
async def test_logout_success(db_session: AsyncSession):
    svc = UserService(db_session)
    tokens = await svc.register("alice", "alice@example.com", "secret123", "Alice", UserRole.STUDENT)

    result = await svc.logout(tokens["refresh_token"])
    assert result == {"message": "Logged out"}

    # Session should be deleted
    from sqlalchemy import select

    res = await db_session.execute(
        select(AuthSession).where(AuthSession.token == tokens["refresh_token"])
    )
    assert res.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_logout_nonexistent_token_still_ok(db_session: AsyncSession):
    svc = UserService(db_session)
    result = await svc.logout("nonexistent.token.value")
    assert result == {"message": "Logged out"}
