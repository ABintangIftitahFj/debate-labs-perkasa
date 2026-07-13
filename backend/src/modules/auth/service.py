from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.exceptions import UnauthorizedError
from src.core.security import create_access_token, create_refresh_token, decode_token, verify_password
from src.modules.user.repository import AuthSession, User
from src.modules.user.service import UserService


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_service = UserService(db)

    async def register(self, username: str, email: str, password: str, full_name: str, role: str) -> dict:
        from src.modules.user.schemas import UserCreate

        user = await self.user_service.create(
            UserCreate(username=username, email=email, password=password, full_name=full_name, role=role)
        )
        return await self._create_tokens(user)

    async def login(self, email: str, password: str) -> dict:
        user = await self.user_service.get_by_email(email)
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

        if not session or session.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("Refresh token expired or invalid")

        await self.db.delete(session)
        await self.db.commit()

        user = await self.user_service.get_by_id(user_id)
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
