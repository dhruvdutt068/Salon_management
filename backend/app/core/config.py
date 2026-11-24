import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if os.getenv("VERCEL"):
    DEFAULT_DB_FILE = Path("/tmp") / "salon_queue.db"
else:
    DEFAULT_DB_FILE = BASE_DIR / "salon_queue.db"

class Settings:
    PROJECT_NAME: str = "Salon Queue Management System API"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_FILE.as_posix()}")
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
