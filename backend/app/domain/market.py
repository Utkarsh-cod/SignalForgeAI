from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
import datetime
from app.core.database import Base

class PredictionRecord(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    date = Column(String, index=True)
    price = Column(Float)
    baseline_direction = Column(String)
    baseline_prob = Column(Float)
    hybrid_direction = Column(String)
    hybrid_prob = Column(Float)
    sentiment_score = Column(Float)
    sentiment_confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EvaluationRecord(Base):
    __tablename__ = "evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String) # 'baseline' or 'hybrid'
    accuracy = Column(Float)
    f1 = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    directional_accuracy = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
