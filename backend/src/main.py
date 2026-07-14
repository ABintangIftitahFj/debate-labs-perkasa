import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.config import settings
from src.core.logging_config import init_logging
from src.modules.user.router import router as user_router

init_logging(env=settings.LOG_ENV)
logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s %d %.1fms",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
        )
        return response


app = FastAPI(
    title="Debate Labs Perkasa Backend",
    description="Backend API for Debate Labs Perkasa",
    version="0.1.0",
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/v1/users", tags=["Users"])


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health():
    return {"status": "ok"}
