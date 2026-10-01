import pandas as pd
import os

def load_price_data(file_path: str) -> pd.DataFrame:
    """
    Load historical stock price data from CSV.
    Validates date format and sorts chronologically.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at: {file_path}")
        
    df = pd.read_csv(file_path)
    
    # Required columns
    required_cols = ["date", "open", "high", "low", "close", "volume"]
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
        
    # The existing dataset uses 'DD-MM-YY' format (e.g. 22-01-99)
    # We explicitly parse it to avoid date corruption
    try:
        df["date"] = pd.to_datetime(df["date"], format="%d-%m-%y")
    except Exception as e:
        # Fallback if the format is different in newer datasets
        df["date"] = pd.to_datetime(df["date"])
        
    # Drop rows with missing essential data
    df = df.dropna(subset=required_cols)
        
    # Sort chronologically (oldest to newest) to prevent leakage
    df = df.sort_values("date").reset_index(drop=True)
    
    # Handle duplicates by keeping the last entry for a day
    df = df.drop_duplicates(subset=["date"], keep="last").reset_index(drop=True)
    
    # Ensure minimum history
    if len(df) < 200:
        raise ValueError("Insufficient historical data (need at least 200 days for SMA200).")
        
    return df
