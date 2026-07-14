from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.config import settings
from src.core.exceptions import ConflictError, ForbiddenError, NotFoundError, UnauthorizedError
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from src.modules.user.repository import AuthSession, CoachProfile, StudentProfile, User, UserRole
from src.modules.user.schemas import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CRUD ──────────────────────────────────────────────

    async def get_by_id(self, user_id: int) -> User:
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.coach_profile),
                selectinload(User.student_profile),
            )
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if user is None:
            raise NotFoundError(f"User with id {user_id} not found")
        return user

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        existing_email = await self.get_by_email(data.email)
        if existing_email is not None:
            raise ConflictError(f"Email {data.email} is already in use")

        existing_username = await self.get_by_username(data.username)
        if existing_username is not None:
            raise ConflictError(f"Username {data.username} is already in use")

        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
        )
        self.db.add(user)
        await self.db.flush()

        if data.role.value == "student" and data.student_profile:
            student_profile = StudentProfile(user_id=user.id, **data.student_profile.model_dump())
            self.db.add(student_profile)
        elif data.role.value == "coach" and data.coach_profile:
            coach_profile = CoachProfile(user_id=user.id, **data.coach_profile.model_dump())
            self.db.add(coach_profile)

        await self.db.commit()
        return await self.get_by_id(user.id)

    async def update(self, user_id: int, data: UserUpdate) -> User:
        user = await self.get_by_id(user_id)

        if data.full_name is not None:
            user.full_name = data.full_name

        if data.student_profile and user.student_profile:
            for key, value in data.student_profile.model_dump(exclude_unset=True).items():
                setattr(user.student_profile, key, value)
        elif data.student_profile and not user.student_profile:
            profile = StudentProfile(user_id=user.id, **data.student_profile.model_dump())
            self.db.add(profile)

        if data.coach_profile and user.coach_profile:
            for key, value in data.coach_profile.model_dump(exclude_unset=True).items():
                setattr(user.coach_profile, key, value)
        elif data.coach_profile and not user.coach_profile:
            profile = CoachProfile(user_id=user.id, **data.coach_profile.model_dump())
            self.db.add(profile)

        await self.db.commit()
        user_id = user.id
        self.db.expire(user)
        return await self.get_by_id(user_id)

    # ── Auth ──────────────────────────────────────────────

    async def register(self, username: str, email: str, password: str, full_name: str, role: UserRole) -> dict:
        from src.modules.user.schemas import UserCreate

        if role == "admin":
            raise ForbiddenError("Cannot self-register as admin")

        user = await self.create(
            UserCreate(username=username, email=email, password=password, full_name=full_name, role=role)
        )
        return await self._create_tokens(user)

    async def login(self, email: str, password: str) -> dict:
        user = await self.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")
        return await self._create_tokens(user)

    async def refresh(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")

        user_id = int(payload["sub"])
        result = await self.db.execute(select(AuthSession).where(AuthSession.token == refresh_token))
        session = result.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        if not session:
            raise UnauthorizedError("Refresh token expired or invalid")
        expires_at = session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise UnauthorizedError("Refresh token expired or invalid")

        await self.db.delete(session)
        await self.db.commit()

        user = await self.get_by_id(user_id)
        return await self._create_tokens(user)

    async def logout(self, refresh_token: str) -> dict:
        result = await self.db.execute(select(AuthSession).where(AuthSession.token == refresh_token))
        session = result.scalar_one_or_none()
        if session:
            await self.db.delete(session)
            await self.db.commit()
        return {"message": "Logged out"}

    async def _create_tokens(self, user: User) -> dict:
        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id)

        session = AuthSession(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        )
        self.db.add(session)
        await self.db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
