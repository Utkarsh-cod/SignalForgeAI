from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, stocks, predictions, evaluation, news

app = FastAPI(
    title="P_100 Hybrid Stock Intelligence",
    description="Stock Price Prediction Using ML + LLM Sentiment",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(stocks.router, prefix="/api/v1/stock", tags=["Stock Data"])
app.include_router(predictions.router, prefix="/api/v1/stock", tags=["Predictions"])
app.include_router(evaluation.router, prefix="/api/v1/stock", tags=["Evaluation"])
app.include_router(news.router, prefix="/api/v1/stock", tags=["News"])

from pydantic import BaseModel
class AnalyzeRequest(BaseModel):
    headline: str

@app.post('/api/v1/news/analyze', tags=['News'])
def analyze_headline(req: AnalyzeRequest):
    from app.engines.sentiment_llm import SentimentEngine
    import os
    db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'p100_cache.db')
    engine = SentimentEngine(db_path=db_path)
    res = engine.analyze(req.headline)
    return {'success': True, 'result': res, 'warnings': []}
