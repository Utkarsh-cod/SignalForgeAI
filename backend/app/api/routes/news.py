from fastapi import APIRouter, Depends, HTTPException
from app.api.dependencies import get_forecast_service, validate_ticker
from app.api.schemas import NewsResponse
from app.services.forecast_service import ForecastService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{ticker}/news", response_model=NewsResponse)
def get_news(
    ticker: str,
    service: ForecastService = Depends(get_forecast_service)
):
    ticker = validate_ticker(ticker)
    try:
        result = service.get_news()
        return {"success": True, "result": result, "warnings": []}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="News dataset not found.")
    except Exception as e:
        logger.error(f"News error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch news data.")

@router.get('/{ticker}/sentiment')
def get_sentiment(ticker: str, service: ForecastService = Depends(get_forecast_service)):
    return get_news(ticker, service)

from pydantic import BaseModel
class AnalyzeRequest(BaseModel):
    headline: str

@router.post('/analyze')
def post_analyze(req: AnalyzeRequest):
    from app.engines.sentiment_llm import SentimentEngine
    engine = SentimentEngine()
    res = engine.analyze(req.headline)
    return {'success': True, 'result': res, 'warnings': []}
