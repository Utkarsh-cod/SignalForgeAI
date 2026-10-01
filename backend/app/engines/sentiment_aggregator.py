import pandas as pd
import numpy as np
import os

def aggregate_daily_sentiment(news_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate sentiment scores by date.
    Calculates mean, std, counts.
    """
    if news_df.empty:
        return pd.DataFrame()
        
    # Ensure date is string or datetime for grouping
    news_df["date"] = pd.to_datetime(news_df["date"])
    
    # Calculate components
    agg_funcs = {
        "sentiment_score": ["mean", "std"],
        "sentiment_confidence": ["mean"],
        "headline": "count"
    }
    
    daily = news_df.groupby("date").agg(agg_funcs)
    
    # Flatten columns
    daily.columns = ["sentiment_mean", "sentiment_std", "confidence_mean", "news_count"]
    
    # Fill NaN std with 0
    daily["sentiment_std"] = daily["sentiment_std"].fillna(0.0)
    
    # Count sentiments
    pos = news_df[news_df["sentiment"] == "positive"].groupby("date").size()
    neg = news_df[news_df["sentiment"] == "negative"].groupby("date").size()
    neu = news_df[news_df["sentiment"] == "neutral"].groupby("date").size()
    
    daily["positive_count"] = pos
    daily["negative_count"] = neg
    daily["neutral_count"] = neu
    
    daily = daily.fillna(0.0)
    
    return daily.reset_index()
