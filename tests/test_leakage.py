import pytest
import pandas as pd
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.engines.data_loader import load_price_data
from app.engines.features import generate_technical_features
from app.engines.backtester import run_backtest
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "nvidia_stock_data_1999_2026.csv")

# 11. Leakage test
def test_no_leakage_from_future():
    df = load_price_data(DATA_PATH)
    # Take a snippet
    df = df.head(500).copy()
    
    # Generate features
    df_feat, feature_cols = generate_technical_features(df)
    
    # Take row i
    row_100 = df_feat.iloc[100]
    
    # Now modify the future prices (e.g. index 101 onwards) to be 1000000
    df_future_modified = df.copy()
    future_dates = df_future_modified.index > df_feat.index[100]
    df_future_modified.loc[future_dates, "close"] = 1000000
    
    df_feat_modified, _ = generate_technical_features(df_future_modified)
    row_100_modified = df_feat_modified.iloc[100]
    
    # If there is leakage, row 100 features would change when future prices change
    for col in feature_cols:
        val1 = row_100[col]
        val2 = row_100_modified[col]
        if pd.isna(val1) and pd.isna(val2):
            continue
        assert np.isclose(val1, val2), f"Leakage detected in {col}! Changing future prices altered past features."

# 15. Backtest alignment
def test_backtest_alignment():
    # Verify that the backtest doesn't look ahead
    df = load_price_data(DATA_PATH)
    df = df.tail(500).copy()
    df, features = generate_technical_features(df)
    
    # Create fake predictions (always predict 1 / UP)
    predictions = np.ones(len(df))
    
    results = run_backtest(df, predictions)
    # Strategy should make money if market goes up
    # It takes position at close of day t, so return is captured on t+1
    # Check that lengths match
    assert len(results["timeseries"]) == len(df) - 1
    assert "cumulative_return" in results
