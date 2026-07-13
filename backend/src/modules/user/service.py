from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.exceptions import ConflictError, NotFoundError
from src.core.security import hash_password
from src.modules.user.repository import User, CoachProfile, StudentProfile
from src.modules.user.schemas import UserCreate, UserUpdate

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Get a user by their ID, including their coach and student profiles
    async def get_by_id(self, user_id: int) -> User:
        result = await self.db.execute(
            select(User).options(
                selectinload(User.coach_profile),
                selectinload(User.student_profile)
            ).where(User.id == user_id)
        )

        user = result.scalar_one_or_none()
        if user is None:
            raise NotFoundError(f"User with id {user_id} not found")
        return user

    # Get a user by their email
    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    # Get a user by their username
    async def get_by_username(self, username: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    # Create a new user
    async def create(self, data: UserCreate) -> User:

        # Check if the email is already in use
        existing_email = await self.get_by_email(data.email)
        if existing_email is not None:
            raise ConflictError(f"Email {data.email} is already in use")

        # Check if the username is already in use
        existing_username = await self.get_by_username(data.username)
        if existing_username is not None:
            raise ConflictError(f"Username {data.username} is already in use")

        # Create the user
        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
        )
        # Add the user to the database
        self.db.add(user)
        await self.db.flush()

        # Add the user's profile to the database
        if data.role.value == "student" and data.student_profile:
            student_profile = StudentProfile(user_id=user.id, **data.student_profile.model_dump())
            self.db.add(student_profile)
        elif data.role.value == "coach" and data.coach_profile:
            coach_profile = CoachProfile(user_id=user.id, **data.coach_profile.model_dump())
            self.db.add(coach_profile)

        # Commit the changes to the database
        await self.db.commit()
        return await self.get_by_id(user.id)

    # Update the user's profile
    async def update(self, user_id: int, data: UserUpdate) -> User:
        user = await self.get_by_id(user_id)

        # Update full name if it is provided
        if data.full_name is not None:
            user.full_name = data.full_name

        # Update student profile if it exists, otherwise create a new one
        if data.student_profile and user.student_profile:
            for key, value in data.student_profile.model_dump(exclude_unset=True).items():
                setattr(user.student_profile, key, value)
        elif data.student_profile and not user.student_profile:
            profile = StudentProfile(user_id=user.id, **data.student_profile.model_dump())
            self.db.add(profile)

        # Update coach profile if it exists, otherwise create a new one
        if data.coach_profile and user.coach_profile:
            for key, value in data.coach_profile.model_dump(exclude_unset=True).items():
                setattr(user.coach_profile, key, value)
        elif data.coach_profile and not user.coach_profile:
            profile = CoachProfile(user_id=user.id, **data.coach_profile.model_dump())
            self.db.add(profile)

        await self.db.commit()
        return await self.get_by_id(user.id)