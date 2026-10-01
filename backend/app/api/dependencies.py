import os
from app.services.forecast_service import ForecastService
from fastapi import HTTPException

# Calculate project root dynamically so uvicorn works from anywhere
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

# Global instance for routes to use
forecast_service = ForecastService(data_dir=DATA_DIR, models_dir=MODELS_DIR)

def get_forecast_service() -> ForecastService:
    return forecast_service

def validate_ticker(ticker: str) -> str:
    ticker = ticker.upper()
    if ticker != "NVDA":
        raise HTTPException(status_code=404, detail="Ticker not supported. Only NVDA is available.")
    return ticker
