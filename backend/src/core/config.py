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

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()