from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.init_db import init_db
from app.api.queue import router as queue_router
from app.api.barbers import router as barbers_router
from app.api.services import router as services_router
from app.api.stats import router as stats_router
from app.api.websocket import router as ws_router
from app.api.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data
    init_db()
    yield

app = FastAPI(
    title="Salon Queue Management System API",
    version="1.0.0",
    description="Backend API for Salon Queue Management System",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(queue_router)
app.include_router(barbers_router)
app.include_router(services_router)
app.include_router(stats_router)
app.include_router(ws_router)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Salon Queue Management API"}
