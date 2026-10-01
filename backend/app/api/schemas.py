from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class APIResponse(BaseModel):
    success: bool
    result: Any
    warnings: List[str] = []
    request_id: Optional[str] = None

class PredictionModel(BaseModel):
    direction: str
    probability: float

class SentimentModel(BaseModel):
    score: float
    confidence: float

class ForecastResult(BaseModel):
    ticker: str
    date: str
    price: float
    baseline: PredictionModel
    sentiment: SentimentModel
    warning: str
    hybrid: Optional[PredictionModel] = None

class ForecastResponse(APIResponse):
    result: ForecastResult

class NewsItem(BaseModel):
    date: str
    headline: str
    sentiment: str
    sentiment_score: float
    sentiment_confidence: float

class NewsResponse(APIResponse):
    result: List[NewsItem]

class MarketDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    sma_20: Optional[float]
    sma_50: Optional[float]
    sma_200: Optional[float]
    rsi_14: Optional[float]
    macd: Optional[float]
    volatility_20: Optional[float]
    volume_ratio: Optional[float]
    daily_return: Optional[float]

class MarketResponse(APIResponse):
    result: List[MarketDataPoint]

class EvaluationMetrics(BaseModel):
    accuracy: float
    f1: float
    precision: float
    recall: float
    directional_accuracy: float
    confusion_matrix: List[List[int]]
    feature_importance: Optional[Dict[str, float]] = None

class EvaluationResult(BaseModel):
    baseline: EvaluationMetrics
    hybrid: EvaluationMetrics
    backtest: Dict[str, Any]

class EvaluationResponse(APIResponse):
    result: EvaluationResult
