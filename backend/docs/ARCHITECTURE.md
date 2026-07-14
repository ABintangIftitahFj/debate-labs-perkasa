# Backend Architecture - Modular Monolith

## 1. Overview

Debate Labs backend implements a **Modular Monolith** architecture organized by feature boundaries. Each module encapsulates its own routes, services, repositories, and schemas while sharing a common infrastructure layer.

## 2. Directory Structure

```
backend/
├── src/
│   ├── main.py                    # Application entry point
│   ├── core/                      # Shared infrastructure
│   │   ├── __init__.py
│   │   ├── config.py              # Settings & env loading
│   │   ├── database.py            # SQLAlchemy engine & session
│   │   ├── security.py            # JWT, password hashing
│   │   └── exceptions.py          # Global error handlers
│   │
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication & authorization
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── user/                  # User profiles & management
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── classroom/             # Rooms, membership, syllabus
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── motion/                # Debate motions bank
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── debate/                # Debate sessions & evaluation
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── audio/                 # Audio ingestion & acoustic analysis
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── processor.py       # FFmpeg preprocessing
│   │   │   └── schemas.py
│   │   │
│   │   ├── ai/                    # Gemini, LangChain orchestration
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── agents.py          # LangGraph agent definitions
│   │   │   └── schemas.py
│   │   │
│   │   ├── kusir/                 # Real-time debate (WebSocket)
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── manager.py         # Connection manager
│   │   │   ├── service.py
│   │   │   └── schemas.py
│   │   │
│   │   └── knowledge/             # RAG & vector search
│   │       ├── __init__.py
│   │       ├── router.py
│   │       ├── service.py
│   │       ├── repository.py
│   │       └── schemas.py
│   │
│   └── migrations/                # Alembic migrations
│       ├── env.py
│       └── versions/
│
├── docker-compose.yml
├── init.sql
├── requirements.txt
├── alembic.ini
└── .env.example
```

## 3. Module Dependency Rules

```
┌─────────────────────────────────────────────────┐
│                   routers                        │
├─────────────────────────────────────────────────┤
│                   services                       │
├─────────────────────────────────────────────────┤
│                 repositories                     │
├─────────────────────────────────────────────────┤
│          core (database, config, auth)           │
└─────────────────────────────────────────────────┘
```

### Allowed Dependencies

| Layer | Can Import |
|-------|------------|
| `router.py` | `service.py`, `schemas.py`, `core.security` |
| `service.py` | `repository.py`, `schemas.py`, other module services (explicit only) |
| `repository.py` | `core.database`, SQLAlchemy models only |
| `schemas.py` | Pydantic only; shared enums/types from `repository.py` are allowed |

### Forbidden

- Module A router → Module B repository (skip service layer)
- Circular imports between modules
- Business logic in routers

## 4. Module Responsibilities

| Module | Purpose | Key Entities |
|--------|---------|--------------|
| `auth` | Login, register, JWT tokens, role guards | `auth_sessions` |
| `user` | Profile CRUD, role management | `users` |
| `classroom` | Room creation, membership, syllabus | `classrooms`, `classroom_members` |
| `motion` | Motion bank, filtering, assignment | `motions` |
| `debate` | Session lifecycle, scoring | `debates` |
| `audio` | Ingestion, FFmpeg, acoustic metrics | (processing only) |
| `ai` | Gemini calls, LangGraph orchestration | (stateless) |
| `kusir` | WebSocket sessions, real-time AI | (stateless) |
| `knowledge` | Vector store, RAG retrieval | `knowledge_base` |

## 5. Cross-Module Communication

Modules communicate through **service imports**, not direct repository access:

```python
# modules/debate/service.py
from modules.motion.service import MotionService

class DebateService:
    def __init__(self, db: AsyncSession):
        self.motion_service = MotionService(db)

    async def create_debate(self, motion_id: int):
        motion = await self.motion_service.get_by_id(motion_id)
        # ...
```

## 6. Shared Infrastructure (`core/`)

| File | Responsibility |
|------|----------------|
| `config.py` | Pydantic Settings, `.env` loading |
| `database.py` | Async SQLAlchemy engine, `get_db` dependency |
| `security.py` | JWT encode/decode, password hashing, `get_current_user` |
| `exceptions.py` | Custom exceptions, global error handlers |

## 7. API Routing

All module routers are registered in `main.py`:

```python
from fastapi import FastAPI
from modules.auth.router import router as auth_router
from modules.user.router import router as user_router
from modules.classroom.router import router as classroom_router
# ...

app = FastAPI(title="Debate Labs API")

app.include_router(auth_router, prefix="/v1/auth", tags=["Auth"])
app.include_router(user_router, prefix="/v1/users", tags=["Users"])
app.include_router(classroom_router, prefix="/v1/classrooms", tags=["Classrooms"])
# ...
```

## 8. Database Schema Approach

Each module owns its models in `repository.py` (or a dedicated `models.py` if complex):

```python
# modules/classroom/repository.py
from sqlalchemy import Column, Integer, String, ForeignKey
from core.database import Base

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    room_code = Column(String(8), unique=True, nullable=False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
```

## 9. Request Lifecycle

```
Client Request
     │
     ▼
  Router (validation, auth guard)
     │
     ▼
  Service (business logic, orchestration)
     │
     ├─▶ Repository (DB queries)
     │
     ├─▶ External Service (AI, audio, etc.)
     │
     ▼
  Response (schemas)
```
