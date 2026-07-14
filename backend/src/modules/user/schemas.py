from datetime import datetime

from pydantic import BaseModel, EmailStr

from src.modules.user.repository import UserRole


class StudentProfileSchema(BaseModel):
    """Nested schema for student profile — all fields optional for partial updates."""

    bio: str | None = None
    school_name: str | None = None
    grade_level: str | None = None


class CoachProfileSchema(BaseModel):
    """Nested schema for coach profile — all fields optional for partial updates."""

    institution: str | None = None
    subjects: str | None = None
    years_of_experience: int | None = None


class UserCreate(BaseModel):
    """Schema for creating a new user — used by service.register() and service.create()."""

    username: str
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    # optional profile data: only the one matching the role is persisted
    student_profile: StudentProfileSchema | None = None
    coach_profile: CoachProfileSchema | None = None


class UserResponse(BaseModel):
    """Public user representation — returned by all user-facing endpoints.

    from_attributes=True lets Pydantic read directly from the SQLAlchemy model
    (i.e. User(**user) or UserResponse.model_validate(user)).
    """

    id: int
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    student_profile: StudentProfileSchema | None = None
    coach_profile: CoachProfileSchema | None = None
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Partial update schema — only non-None fields are applied.

    Profile fields are optional: if provided and profile exists, fields are
    merged; if provided and profile doesn't exist, a new profile is created.
    """

    full_name: str | None = None
    student_profile: StudentProfileSchema | None = None
    coach_profile: CoachProfileSchema | None = None


class RegisterRequest(BaseModel):
    """POST /v1/users/register body — same as UserCreate but without profile fields."""

    username: str
    email: EmailStr
    password: str
    full_name: str
    role: UserRole


class LoginRequest(BaseModel):
    """POST /v1/users/login body."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Standard JWT response — returned by register, login, and refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"  # fixed value per OAuth2 spec


class RefreshRequest(BaseModel):
    """POST /v1/users/refresh and /v1/users/logout body."""

    refresh_token: str
