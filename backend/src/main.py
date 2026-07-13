from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.modules.auth.router import router as auth_router
from src.modules.user.router import router as user_router

app = FastAPI(
    title="Debate Labs Perkasa Backend",
    description="Backend API for Debate Labs Perkasa",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/v1/auth", tags=["Auth"])
app.include_router(user_router, prefix="/v1/users", tags=["Users"])


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health():
    return {"status": "ok"}
