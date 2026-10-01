from fastapi import APIRouter, Depends, HTTPException
from app.api.dependencies import get_forecast_service, validate_ticker
from app.api.schemas import EvaluationResponse
from app.services.forecast_service import ForecastService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{ticker}/evaluation", response_model=EvaluationResponse)
def get_evaluation(
    ticker: str,
    service: ForecastService = Depends(get_forecast_service)
):
    ticker = validate_ticker(ticker)
    try:
        result = service.get_evaluation()
        return {"success": True, "result": result, "warnings": []}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Required data/model files missing for evaluation.")
    except Exception as e:
        logger.error(f"Evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch evaluation metrics.")
