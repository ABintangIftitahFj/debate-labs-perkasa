"""Centralized logging configuration — dev (human-readable) and production (JSON).

Usage (called once in main.py)::

    init_logging(env=settings.LOG_ENV)

Every module creates its own logger::

    logger = logging.getLogger(__name__)
"""

import json
import logging
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Structured JSON formatter for production — one JSON object per line."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        # Attach exception traceback if present
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry, ensure_ascii=False)


class DevFormatter(logging.Formatter):
    """Human-readable formatter for local development."""

    FMT = "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
    DATEFMT = "%Y-%m-%d %H:%M:%S"

    def __init__(self) -> None:
        super().__init__(fmt=self.FMT, datefmt=self.DATEFMT)


def init_logging(*, env: str = "dev") -> None:
    """Wire up root logger.  Call once in main.py before anything else logs."""
    root = logging.getLogger()

    if env == "production":
        # Production: JSON to stdout (containers read stdout)
        root.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        root.addHandler(handler)
    else:
        # Dev: human-readable text, DEBUG level, console only
        root.setLevel(logging.DEBUG)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(DevFormatter())
        root.addHandler(handler)

    # SQLAlchemy logs every SQL at INFO — too noisy in prod, useful in dev
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.WARNING if env == "production" else logging.INFO
    )
    # Uvicorn core + error at INFO, suppress access logs (middleware handles it)
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
