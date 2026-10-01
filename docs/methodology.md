# Methodology

## Feature Engineering
The pipeline processes raw `[open, high, low, close, volume]` data into stationary indicators:
- **SMA**: 20, 50, and 200-day Simple Moving Averages.
- **RSI (14)**: Relative Strength Index to measure overbought/oversold conditions.
- **MACD**: Moving Average Convergence Divergence to capture momentum shifts.
- **Volatility (20)**: 20-day rolling standard deviation of daily returns.
- **Volume Ratio**: Current volume / 20-day average volume.

## Leakage Prevention
- **Time-Series Split**: Data is not randomly shuffled. The last 20% of data is strictly reserved for testing.
- **Target Shifting**: The target variable `next_day_close > current_close` is created by shifting the label backwards (`df['close'].shift(-1)`), ensuring tomorrow's price is never exposed as a feature for today.
- **Test Suite**: Automated Pytest suites actively modify future data to assert that historical features do not change (zero leakage).

## Hybrid Sentiment Fusion
1. **News Aggregation**: Recent news headlines for the target date are fetched.
2. **LLM Scoring**: Headlines are scored by an LLM prompt strictly enforced via `response_format={"type": "json_object"}`.
3. **Fusion Logic**:
   - The ML baseline model provides a `base_probability` (e.g., 0.55 for UP).
   - The sentiment score is weighted and applied as an adjustment.
   - Formula: `final_prob = base_prob + (sentiment_score * sentiment_confidence * 0.1)`.
   - If `final_prob > 0.5`, the prediction is UP.
