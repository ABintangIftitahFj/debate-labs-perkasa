from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.user.repository import User
from src.modules.user.schemas import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    UserUpdate,
)
from src.modules.user.service import UserService

router = APIRouter()


# ── Auth ──────────────────────────────────────────────


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user.  Returns access + refresh tokens on success."""
    service = UserService(db)
    return await service.register(
        data.username, data.email, data.password, data.full_name, data.role
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate by email + password.  Returns access + refresh tokens."""
    service = UserService(db)
    return await service.login(data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Rotate refresh token.  Old token is revoked, new pair is returned."""
    service = UserService(db)
    return await service.refresh(data.refresh_token)


@router.post("/logout")
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Revoke a refresh token.  Idempotent — always returns success."""
    service = UserService(db)
    return await service.logout(data.refresh_token)


# ── User ──────────────────────────────────────────────


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile.  Requires valid access token."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Partial update of the authenticated user's profile.  Only sent fields are applied."""
    service = UserService(db)
    return await service.update(current_user.id, data)
