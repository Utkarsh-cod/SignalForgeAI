import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "P_100 Hybrid Stock Intelligence"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./p100.db")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://openrouter.ai/api/v1")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "google/gemini-2.5-flash")
    
    class Config:
        env_file = ".env"

settings = Settings()
