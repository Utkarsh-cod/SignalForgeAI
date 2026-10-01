from fastapi import APIRouter, Depends, HTTPException
from app.api.dependencies import get_forecast_service, validate_ticker
from app.api.schemas import ForecastResponse
from app.services.forecast_service import ForecastService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{ticker}/prediction", response_model=ForecastResponse)
def get_prediction(
    ticker: str,
    service: ForecastService = Depends(get_forecast_service)
):
    ticker = validate_ticker(ticker)
    try:
        result = service.get_forecast(ticker)
        return {"success": True, "result": result, "warnings": []}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset or model files missing. Cannot generate prediction.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate prediction.")

@router.post('/predict')
def post_predict(service: ForecastService = Depends(get_forecast_service)):
    return get_prediction('NVDA', service)
