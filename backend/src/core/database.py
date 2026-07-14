from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from src.core.config import settings

# Async engine: connection pool managed by asyncpg, SQL echo off by default
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Session factory: expire_on_commit=False lets us access attributes after commit
# without triggering a lazy load (which would fail outside the original greenlet)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Base class for all ORM models — Alembic discovers tables via this
class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency: yield a session, always close it in finally."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
