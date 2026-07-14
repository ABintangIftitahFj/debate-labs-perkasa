from datetime import datetime, timedelta, timezone
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.config import settings
from src.core.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from src.modules.user.repository import (
    AuthSession,
    CoachProfile,
    StudentProfile,
    User,
    UserRole,
)
from src.modules.user.schemas import UserCreate, UserUpdate

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CRUD ──────────────────────────────────────────────

    async def get_by_id(self, user_id: int) -> User:
        """Fetch user by id with both profiles eagerly loaded (avoids greenlet errors)."""
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
        """Lookup by email — returns None instead of raising (used in login/duplicate checks)."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        """Lookup by username — returns None instead of raising (used in duplicate checks)."""
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        """Create user + optional profile.  Checks email/username uniqueness first."""
        # Check for existing email
        existing_email = await self.get_by_email(data.email)
        if existing_email is not None:
            raise ConflictError(f"Email {data.email} is already in use")

        # Check for existing username
        existing_username = await self.get_by_username(data.username)
        if existing_username is not None:
            raise ConflictError(f"Username {data.username} is already in use")

        # Hash password before storing — never store plaintext
        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
        )
        self.db.add(user)
        # flush() assigns the auto-generated user.id without committing,
        # so we can use it as a foreign key for the profile below
        await self.db.flush()

        # Only create the profile that matches the user's role
        if data.role.value == "student" and data.student_profile:
            student_profile = StudentProfile(
                user_id=user.id, **data.student_profile.model_dump()
            )
            self.db.add(student_profile)
        elif data.role.value == "coach" and data.coach_profile:
            coach_profile = CoachProfile(
                user_id=user.id, **data.coach_profile.model_dump()
            )
            self.db.add(coach_profile)

        # Commit both user + profile in one transaction
        await self.db.commit()
        # Re-fetch with selectinload so returned user has profiles populated
        return await self.get_by_id(user.id)

    async def update(self, user_id: int, data: UserUpdate) -> User:
        """Partial update — only non-None fields are applied.

        Profile logic:
          - profile exists + data provided → merge fields via setattr
          - profile missing + data provided → create new profile
          - no data → profile untouched
        """
        user = await self.get_by_id(user_id)

        if data.full_name is not None:
            user.full_name = data.full_name

        # Student profile: update existing or create new
        if data.student_profile and user.student_profile:
            # exclude_unset=True: only overwrite fields the client actually sent
            for key, value in data.student_profile.model_dump(
                exclude_unset=True
            ).items():
                setattr(user.student_profile, key, value)
        elif data.student_profile and not user.student_profile:
            profile = StudentProfile(
                user_id=user.id, **data.student_profile.model_dump()
            )
            self.db.add(profile)

        # Coach profile: same pattern as student
        if data.coach_profile and user.coach_profile:
            for key, value in data.coach_profile.model_dump(exclude_unset=True).items():
                setattr(user.coach_profile, key, value)
        elif data.coach_profile and not user.coach_profile:
            profile = CoachProfile(user_id=user.id, **data.coach_profile.model_dump())
            self.db.add(profile)

        await self.db.commit()
        # expire() clears the SQLAlchemy identity map so get_by_id fetches fresh data
        user_id = user.id
        self.db.expire(user)
        return await self.get_by_id(user_id)

    # ── Auth ──────────────────────────────────────────────

    async def register(
        self, username: str, email: str, password: str, full_name: str, role: UserRole
    ) -> dict:
        """Register a new user and return JWT tokens.

        Admin self-registration is blocked — admins must be created via CLI/seeder.
        """
        # Local import to avoid circular dependency (schemas imports UserRole from repo)
        from src.modules.user.schemas import UserCreate

        if role == "admin":
            logger.warning("Admin self-registration blocked for %s", email)
            raise ForbiddenError("Cannot self-register as admin")

        # Delegate to create() for uniqueness checks + profile handling
        user = await self.create(
            UserCreate(
                username=username,
                email=email,
                password=password,
                full_name=full_name,
                role=role,
            )
        )
        logger.info(
            "User registered: id=%d username=%s role=%s", user.id, username, role
        )
        # Issue access + refresh token pair so user is immediately authenticated
        return await self._create_tokens(user)

    async def login(self, email: str, password: str) -> dict:
        """Authenticate by email + password, return JWT tokens.

        Deliberately uses the same error message for both wrong email and wrong
        password to prevent user enumeration.
        """
        user = await self.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            logger.warning("Failed login attempt for %s", email)
            raise UnauthorizedError("Invalid email or password")
        logger.info("User logged in: id=%d email=%s", user.id, email)
        return await self._create_tokens(user)

    async def refresh(self, refresh_token: str) -> dict:
        """Rotate refresh token: verify old, delete it, issue new pair.

        This implements refresh token rotation — each refresh token is single-use.
        If the token is reused (stolen), the DB lookup will fail because the
        original was already deleted.
        """
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")

        user_id = int(payload["sub"])
        # Look up the session — if not found, token was already revoked/used
        result = await self.db.execute(
            select(AuthSession).where(AuthSession.token == refresh_token)
        )
        session = result.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        if not session:
            logger.warning("Refresh token not found for user_id=%d", user_id)
            raise UnauthorizedError("Refresh token expired or invalid")

        # Guard against naive datetimes from DB — ensure both are timezone-aware before comparing
        expires_at = session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            logger.warning("Refresh token expired for user_id=%d", user_id)
            raise UnauthorizedError("Refresh token expired or invalid")

        # Revoke the used token (single-use rotation)
        await self.db.delete(session)
        await self.db.commit()

        user = await self.get_by_id(user_id)
        logger.info("Token refreshed for user_id=%d", user_id)
        # Issue fresh pair — new refresh token is stored in DB by _create_tokens
        return await self._create_tokens(user)

    async def logout(self, refresh_token: str) -> dict:
        """Revoke a refresh token — idempotent, safe to call even if token is invalid."""
        result = await self.db.execute(
            select(AuthSession).where(AuthSession.token == refresh_token)
        )
        session = result.scalar_one_or_none()
        if session:
            await self.db.delete(session)
            await self.db.commit()
            logger.info("User logged out: session user_id=%d", session.user_id)
        # Always return success — don't leak whether token existed
        return {"message": "Logged out"}

    async def _create_tokens(self, user: User) -> dict:
        """Generate access + refresh token pair.  Persists refresh token in auth_sessions."""
        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id)

        # Store refresh token so it can be verified/revoked later
        session = AuthSession(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        )
        self.db.add(session)
        await self.db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
