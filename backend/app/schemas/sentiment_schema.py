from pydantic import BaseModel, Field

class SentimentResponse(BaseModel):
    sentiment: str = Field(..., description="positive, neutral, or negative")
    score: float = Field(..., ge=-1.0, le=1.0, description="Sentiment score from -1.0 to 1.0")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
