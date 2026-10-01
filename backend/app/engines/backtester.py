import pandas as pd
import numpy as np

def run_backtest(df: pd.DataFrame, predictions: np.ndarray) -> dict:
    """
    Run a hypothetical historical backtest.
    If prediction = UP (1): hypothetical long exposure
    If prediction = DOWN (0): stay in cash
    """
    if len(df) != len(predictions):
        raise ValueError("Length of predictions must match test dataframe length.")
        
    df = df.copy()
    df["prediction"] = predictions
    
    # In a real backtest, we buy at tomorrow's open or today's close
    # Since we predict "will tomorrow's close be higher than today's close",
    # the return we capture if we buy at today's close and sell at tomorrow's close
    # is tomorrow's close / today's close - 1, which is tomorrow's daily_return.
    
    # Shift daily return backward to align with today's prediction
    # df["next_return"] = df["close"].shift(-1) / df["close"] - 1
    # df["strategy_return"] = df["next_return"] * df["prediction"]
    
    # We already have "daily_return" which is today vs yesterday.
    # So if we predict today for tomorrow, tomorrow's daily_return is the profit.
    df["next_return"] = df["daily_return"].shift(-1)
    df["strategy_return"] = df["next_return"] * df["prediction"]
    
    # Drop the last row since we don't know tomorrow's return yet
    valid_df = df.dropna(subset=["next_return"])
    
    # Cumulative returns
    valid_df["cum_benchmark"] = (1 + valid_df["next_return"]).cumprod()
    valid_df["cum_strategy"] = (1 + valid_df["strategy_return"]).cumprod()
    
    total_return = valid_df["cum_strategy"].iloc[-1] - 1 if not valid_df.empty else 0.0
    benchmark_return = valid_df["cum_benchmark"].iloc[-1] - 1 if not valid_df.empty else 0.0
    
    # Number of trades/signals
    num_signals = valid_df["prediction"].sum()
    
    # Win rate
    winning_trades = len(valid_df[(valid_df["prediction"] == 1) & (valid_df["next_return"] > 0)])
    win_rate = winning_trades / num_signals if num_signals > 0 else 0.0
    
    # Max drawdown
    roll_max = valid_df["cum_strategy"].cummax()
    drawdown = valid_df["cum_strategy"] / roll_max - 1.0
    max_drawdown = drawdown.min() if not drawdown.empty else 0.0
    
    return {
        "cumulative_return": float(total_return),
        "benchmark_return": float(benchmark_return),
        "num_signals": int(num_signals),
        "win_rate": float(win_rate),
        "max_drawdown": float(max_drawdown),
        "timeseries": valid_df[["date", "cum_benchmark", "cum_strategy"]].to_dict(orient="records") if "date" in valid_df.columns else []
    }
