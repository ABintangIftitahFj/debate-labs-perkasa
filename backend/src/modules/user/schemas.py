from datetime import datetime

from pydantic import BaseModel, EmailStr

from src.modules.user.repository import UserRole

class StudentProfileSchema(BaseModel):
    bio: str | None = None
    school_name: str | None = None
    grade_level: str | None = None

class CoachProfileSchema(BaseModel):
    institution: str | None = None
    subjects: str | None = None
    years_of_experience: int | None = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole
    full_name: str
    student_profile: StudentProfileSchema | None = None
    coach_profile: CoachProfileSchema | None = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    student_profile: StudentProfileSchema | None = None
    coach_profile: CoachProfileSchema | None = None
    is_verified: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class UserUpdate(BaseModel):
    full_name: str | None = None
    student_profile: StudentProfileSchema | None = None
    coach_profile: CoachProfileSchema | None = None