import enum
from datetime import datetime, timezone

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Boolean, DateTime, Enum, ForeignKey, Text

from src.core.database import Base


# str + enum.Enum so values serialize as plain strings in JSON / DB
class UserRole(str, enum.Enum):
    STUDENT = "student"
    COACH = "coach"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # indexed + unique for fast lookups during login and duplicate checks
    username: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )  # bcrypt hash, never store plaintext
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    is_verified: Mapped[bool] = mapped_column(
        Boolean, default=False
    )  # TODO: email verification flow
    # lambda defaults evaluated per-row, not once at import time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # one user has many refresh sessions (one per device)
    auth_sessions: Mapped[list["AuthSession"]] = relationship(
        "AuthSession", back_populates="user"
    )
    # nullable: only students have this
    student_profile: Mapped["StudentProfile | None"] = relationship(
        "StudentProfile", back_populates="user"
    )
    # nullable: only coaches have this
    coach_profile: Mapped["CoachProfile | None"] = relationship(
        "CoachProfile", back_populates="user"
    )


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # unique=True enforces one profile per user (1:1)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), unique=True, nullable=False
    )
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    school_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    grade_level: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User", back_populates="student_profile")


class CoachProfile(Base):
    __tablename__ = "coach_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), unique=True, nullable=False
    )
    institution: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subjects: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # comma-separated or free text
    years_of_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User", back_populates="coach_profile")


class AuthSession(Base):
    """Stores active refresh tokens.  One row per login (multi-device support)."""

    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )  # not unique: many sessions per user
    token: Mapped[str] = mapped_column(
        Text, unique=True, nullable=False
    )  # the actual refresh JWT string
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    # optional: for audit / rate-limiting
    ip_address: Mapped[str | None] = mapped_column(
        String(45), nullable=True
    )  # 45 = max IPv6 length
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User", back_populates="auth_sessions")
