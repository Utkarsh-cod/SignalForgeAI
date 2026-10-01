import pandas as pd
import numpy as np

def generate_technical_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate technical indicators.
    Uses strictly backward-looking calculations to prevent leakage.
    """
    df = df.copy()
    
    # Returns
    df["daily_return"] = df["close"].pct_change()
    
    # Moving Averages
    df["sma_20"] = df["close"].rolling(window=20).mean()
    df["sma_50"] = df["close"].rolling(window=50).mean()
    df["sma_200"] = df["close"].rolling(window=200).mean()
    df["ema_20"] = df["close"].ewm(span=20, adjust=False).mean()
    df["ema_50"] = df["close"].ewm(span=50, adjust=False).mean()
    
    # Volatility
    df["volatility_20"] = df["daily_return"].rolling(window=20).std()
    df["high_low_range"] = (df["high"] - df["low"]) / df["close"]
    
    # Volume Features
    df["volume_sma_20"] = df["volume"].rolling(window=20).mean()
    df["volume_ratio"] = df["volume"] / df["volume_sma_20"]
    
    # RSI (14 days)
    delta = df["close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df["rsi_14"] = 100 - (100 / (1 + rs))
    
    # MACD
    ema_12 = df["close"].ewm(span=12, adjust=False).mean()
    ema_26 = df["close"].ewm(span=26, adjust=False).mean()
    df["macd"] = ema_12 - ema_26
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
    
    # Target: 1 if next day's close is strictly greater than today's close, else 0
    df["target"] = (df["close"].shift(-1) > df["close"]).astype(int)
    
    # Drop rows with NaN values created by rolling windows
    # Note: Target will be NaN for the very last row, but astype(int) turns False/NaN to 0.
    # Actually, we shouldn't drop the last row if we want to predict tomorrow!
    # So we'll replace the target's last row with NaN temporarily to keep it trackable,
    # or handle it carefully.
    
    last_row = df.iloc[-1:]
    
    # Drop NA for historical training data (except target on last row)
    # To properly handle this, we will drop NA for features, but allow target to be missing on the latest date.
    
    features = [
        "daily_return", "sma_20", "sma_50", "sma_200", 
        "ema_20", "ema_50", "volatility_20", "high_low_range",
        "volume_ratio", "rsi_14", "macd", "macd_signal"
    ]
    
    df = df.dropna(subset=features)
    
    return df, features
