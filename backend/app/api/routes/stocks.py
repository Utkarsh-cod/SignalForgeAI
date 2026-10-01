from fastapi import APIRouter, Depends, HTTPException
from app.api.dependencies import get_forecast_service, validate_ticker
from app.api.schemas import MarketResponse
from app.services.forecast_service import ForecastService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{ticker}/market", response_model=MarketResponse)
def get_market_data(
    ticker: str,
    service: ForecastService = Depends(get_forecast_service)
):
    ticker = validate_ticker(ticker)
    try:
        result = service.get_market_data()
        return {"success": True, "result": result, "warnings": []}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Historical dataset not found.")
    except Exception as e:
        logger.error(f"Market data error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market data.")

@router.get('/{ticker}')
def get_stock_root(ticker: str, service: ForecastService = Depends(get_forecast_service)):
    return get_market_data(ticker, service)

@router.get('/{ticker}/features')
def get_features(ticker: str, service: ForecastService = Depends(get_forecast_service)):
    return get_market_data(ticker, service)

@router.get('/{ticker}/backtest')
def get_backtest(ticker: str, service: ForecastService = Depends(get_forecast_service)):
    ticker = validate_ticker(ticker)
    try:
        res = service.get_evaluation()
        return {'success': True, 'result': res['backtest'], 'warnings': []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
