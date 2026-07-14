# User Module

Authentication, registration, and profile management for Debate Labs.

## Overview

Base path: `/v1/users`

All endpoints are async. Authentication uses JWT (access + refresh token pair) with bcrypt password hashing. Tokens include a `jti` claim to prevent duplicate token collisions.

## Architecture

```
router.py    → HTTP layer (FastAPI routes, request/response)
service.py   → Business logic (CRUD, auth flows)
schemas.py   → Pydantic models (validation, serialization)
repository.py → SQLAlchemy models (database tables)
```

## Database Tables

### `users`

| Column | Type | Constraints |
|--------|------|------------|
| id | int | PK |
| username | string(30) | unique, indexed |
| email | string(255) | unique, indexed |
| password_hash | string(255) | bcrypt hash |
| full_name | string(100) | |
| role | enum | student / coach / admin |
| is_verified | bool | default false |
| created_at | datetime(tz) | auto |
| updated_at | datetime(tz) | auto |

### `student_profiles`

| Column | Type | Constraints |
|--------|------|------------|
| id | int | PK |
| user_id | int | FK → users.id, unique |
| bio | text | nullable |
| school_name | string(100) | nullable |
| grade_level | string(100) | nullable |

### `coach_profiles`

| Column | Type | Constraints |
|--------|------|------------|
| id | int | PK |
| user_id | int | FK → users.id, unique |
| institution | string(100) | nullable |
| subjects | text | nullable |
| years_of_experience | int | nullable |

### `auth_sessions`

| Column | Type | Constraints |
|--------|------|------------|
| id | int | PK |
| user_id | int | FK → users.id |
| token | text | unique (refresh token) |
| expires_at | datetime(tz) | |
| ip_address | string(45) | nullable |
| user_agent | text | nullable |

## API Endpoints

### `POST /v1/users/register`

Register a new user. Returns token pair immediately.

**Request:**
```json
{
  "username": "budi_debater",
  "email": "budi@example.com",
  "password": "secret123",
  "full_name": "Budi Santoso",
  "role": "student"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors:**
- `409` — Email or username already exists
- `403` — Cannot self-register as admin
- `422` — Validation error (invalid email, missing fields)

---

### `POST /v1/users/login`

Authenticate with email + password.

**Request:**
```json
{
  "email": "budi@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors:**
- `401` — Invalid email or password

---

### `POST /v1/users/refresh`

Exchange a refresh token for a new token pair. Old refresh token is invalidated (rotation).

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors:**
- `401` — Token expired, invalid, or already used

---

### `POST /v1/users/logout`

Delete a refresh token session. Idempotent — returns success even if token doesn't exist.

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response `200`:**
```json
{
  "message": "Logged out"
}
```

---

### `GET /v1/users/me`

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response `200`:**
```json
{
  "id": 1,
  "username": "budi_debater",
  "email": "budi@example.com",
  "full_name": "Budi Santoso",
  "role": "student",
  "student_profile": {
    "bio": null,
    "school_name": "SMAN 1 Jakarta",
    "grade_level": "12"
  },
  "coach_profile": null,
  "is_verified": false,
  "created_at": "2026-07-14T04:27:37Z"
}
```

**Errors:**
- `401` — Missing, invalid, or expired token

---

### `PATCH /v1/users/me`

Update the authenticated user's profile. Partial updates supported.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "full_name": "Budi Santoso Updated",
  "student_profile": {
    "school_name": "SMAN 3 Bandung",
    "grade_level": "11"
  }
}
```

**Response `200`:** Returns full `UserResponse`.

**Errors:**
- `401` — Not authenticated
- `404` — User not found

---

### `GET /v1/users/{user_id}`

Get any user by ID. Public endpoint (no auth required).

**Response `200`:** Returns `UserResponse`.

**Errors:**
- `404` — User not found

## JWT Details

**Access token claims:**
```json
{
  "sub": "1",
  "role": "student",
  "exp": 1784608057,
  "type": "access",
  "jti": "a1b2c3d4..."
}
```

**Refresh token claims:**
```json
{
  "sub": "1",
  "exp": 1785212857,
  "type": "refresh",
  "jti": "e5f6g7h8..."
}
```

- Algorithm: HS256
- Access token expiry: configurable via `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- Refresh token expiry: configurable via `JWT_REFRESH_TOKEN_EXPIRE_DAYS`
- Refresh tokens are stored in `auth_sessions` table and invalidated on use (rotation)

## Configuration

From `.env`:

| Variable | Description |
|----------|------------|
| JWT_SECRET_KEY | Signing key for JWT |
| JWT_ALGORITHM | Algorithm (HS256) |
| JWT_ACCESS_TOKEN_EXPIRE_MINUTES | Access token TTL |
| JWT_REFRESH_TOKEN_EXPIRE_DAYS | Refresh token TTL |

## Dependencies

`src/core/security.py` — `get_current_user` dependency extracts and validates the JWT access token, then loads the user with `selectinload` on both profile relationships.

`src/core/exceptions.py` — Custom HTTP exceptions:
- `NotFoundError` → 404
- `ConflictError` → 409
- `ForbiddenError` → 403
- `UnauthorizedError` → 401

## Tests

```bash
conda activate debate-labs
cd backend
python -m pytest tests/ -v
```

**Unit tests (27):** `tests/unit/user/test_service.py`
- Tests `UserService` methods directly with in-memory SQLite

**Integration tests (22):** `tests/integration/user/test_router.py`
- Tests full HTTP flow through FastAPI endpoints via `httpx.AsyncClient`
- Overrides `get_db` dependency to use SQLite instead of PostgreSQL
