import os
import sys
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.engines.data_loader import load_price_data
from app.engines.features import generate_technical_features
from app.engines.predictor import PricePredictor
from app.engines.evaluator import evaluate_model

DATA_PATH = os.path.join("data", "nvidia_stock_data_1999_2026.csv")
MODEL_PATH = os.path.join("models", "price_model.pkl")

if __name__ == "__main__":
    print("Loading data...")
    df = load_price_data(DATA_PATH)
    
    print("Generating features...")
    df, feature_cols = generate_technical_features(df)
    
    print(f"Training Price-Only Baseline model using {len(feature_cols)} features...")
    predictor = PricePredictor()
    model, train_data, test_data = predictor.train(df, feature_cols)
    
    print("Evaluating model...")
    metrics = evaluate_model(model, test_data, feature_cols)
    
    print("\n" + "="*40)
    print("BASELINE MODEL EVALUATION")
    print("="*40)
    print(f"Accuracy             : {metrics['accuracy']:.4f}")
    print(f"F1 Score             : {metrics['f1']:.4f}")
    print(f"Precision            : {metrics['precision']:.4f}")
    print(f"Recall               : {metrics['recall']:.4f}")
    print(f"Directional Accuracy : {metrics['directional_accuracy']:.4f}")
    print("="*40)
    
    print(f"Saving model to {MODEL_PATH}...")
    predictor.save_model(MODEL_PATH)
    
    print("\n" + "="*40)
    print("TRAINING HYBRID MODEL")
    print("="*40)
    from app.engines.sentiment_aggregator import aggregate_daily_sentiment
    
    NEWS_SCORED_PATH = os.path.join("data", "news_with_sentiment.csv")
    if os.path.exists(NEWS_SCORED_PATH):
        news_df = pd.read_csv(NEWS_SCORED_PATH)
        daily_sentiment = aggregate_daily_sentiment(news_df)
        
        # Merge
        df["date"] = pd.to_datetime(df["date"])
        hybrid_df = pd.merge(df, daily_sentiment, on="date", how="left")
        
        # Fill missing sentiment with neutral/0 values (for days with no news)
        hybrid_df["sentiment_mean"] = hybrid_df["sentiment_mean"].fillna(0.0)
        hybrid_df["sentiment_std"] = hybrid_df["sentiment_std"].fillna(0.0)
        hybrid_df["news_count"] = hybrid_df["news_count"].fillna(0.0)
        hybrid_df["positive_count"] = hybrid_df["positive_count"].fillna(0.0)
        hybrid_df["negative_count"] = hybrid_df["negative_count"].fillna(0.0)
        hybrid_df["neutral_count"] = hybrid_df["neutral_count"].fillna(0.0)
        
        hybrid_features = feature_cols + [
            "sentiment_mean", "sentiment_std", "news_count",
            "positive_count", "negative_count", "neutral_count"
        ]
        
        hybrid_predictor = PricePredictor()
        h_model, h_train, h_test = hybrid_predictor.train(hybrid_df, hybrid_features)
        h_metrics = evaluate_model(h_model, h_test, hybrid_features)
        
        print("\nHYBRID MODEL EVALUATION")
        print("="*40)
        print(f"Accuracy             : {h_metrics['accuracy']:.4f}")
        print(f"F1 Score             : {h_metrics['f1']:.4f}")
        print(f"Precision            : {h_metrics['precision']:.4f}")
        print(f"Recall               : {h_metrics['recall']:.4f}")
        print(f"Directional Accuracy : {h_metrics['directional_accuracy']:.4f}")
        print("="*40)
        
        HYBRID_MODEL_PATH = os.path.join("models", "hybrid_model.pkl")
        hybrid_predictor.save_model(HYBRID_MODEL_PATH)
        
        print("\nTesting prediction on latest data point (Hybrid)...")
        latest_row = hybrid_df.iloc[[-1]]
        direction, prob = hybrid_predictor.predict(latest_row)
        dir_str = "UP" if direction == 1 else "DOWN"
        print(f"Latest Date: {latest_row['date'].iloc[0].strftime('%Y-%m-%d')}")
        print(f"Prediction: {dir_str} (Probability: {prob:.2%})")
    else:
        print(f"Skipping hybrid model: {NEWS_SCORED_PATH} not found.")
