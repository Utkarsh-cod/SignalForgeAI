import os
import sys
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.engines.data_loader import load_price_data
from app.engines.features import generate_technical_features
from app.engines.predictor import PricePredictor
from app.engines.backtester import run_backtest

def main():
    DATA_PATH = os.path.join("data", "nvidia_stock_data_1999_2026.csv")
    df = load_price_data(DATA_PATH)
    df, feature_cols = generate_technical_features(df)
    
    predictor = PricePredictor()
    model, train_data, test_data = predictor.train(df, feature_cols)
    
    predictions = model.predict(test_data[feature_cols])
    
    print("Running Backtest on Test Data...")
    results = run_backtest(test_data, predictions)
    
    print(f"Cumulative Return: {results['cumulative_return']:.2%}")
    print(f"Benchmark Return: {results['benchmark_return']:.2%}")
    print(f"Win Rate: {results['win_rate']:.2%}")
    print(f"Max Drawdown: {results['max_drawdown']:.2%}")
    print(f"Signals: {results['num_signals']}")

if __name__ == "__main__":
    main()
