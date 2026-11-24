from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Salon Queue Management"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/salon_queue"

    class Config:
        env_file = ".env"

settings = Settings()
