from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int

    LOG_ENV: str

    model_config = {
        "env_file": ".env",  # auto-load variables from .env file
        "extra": "ignore",  # silently ignore unknown fields in .env
    }


# Singleton: import once, use everywhere via `from src.core.config import settings`
settings = Settings()  # pyright: ignore[reportCallIssue] — pydantic-settings loads from env
