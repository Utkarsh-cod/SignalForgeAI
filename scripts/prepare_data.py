import os
import sys

# Add backend to path for importing engines
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.engines.data_loader import load_price_data
from app.engines.features import generate_technical_features

DATA_PATH = os.path.join("data", "nvidia_stock_data_1999_2026.csv")

if __name__ == "__main__":
    print(f"Loading data from {DATA_PATH}...")
    df = load_price_data(DATA_PATH)
    print(f"Loaded {len(df)} rows.")
    
    print("Generating technical features...")
    df, feature_cols = generate_technical_features(df)
    
    print(f"Data ready. Total rows with full features: {len(df)}")
    print(f"Features ({len(feature_cols)}): {feature_cols}")
    print("\nSample (latest row):")
    print(df.iloc[-1][["date", "close", "target"] + feature_cols[:3]])
