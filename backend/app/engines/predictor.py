import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
from typing import Tuple, List

class PricePredictor:
    def __init__(self, model_path: str = None):
        self.model = None
        self.feature_columns = None
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
            
    def train(self, df: pd.DataFrame, feature_columns: List[str], n_estimators: int = 100, max_depth: int = 10) -> Tuple[object, pd.DataFrame, pd.DataFrame]:
        """
        Train the price-only baseline model using chronological splitting.
        """
        # Exclude the very last row for training/testing if its target is unknown
        # In our features.py, target is calculated by shifting, so the last row's target is 0 by default.
        # But for actual training, the last row is invalid because we don't know the future yet.
        valid_df = df.iloc[:-1].copy()
        
        # Chronological split: 80% train, 20% test
        split_idx = int(len(valid_df) * 0.8)
        
        train_data = valid_df.iloc[:split_idx]
        test_data = valid_df.iloc[split_idx:]
        
        X_train = train_data[feature_columns]
        y_train = train_data["target"]
        
        self.feature_columns = feature_columns
        
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            random_state=42,
            max_depth=max_depth
        )
        
        self.model.fit(X_train, y_train)
        
        return self.model, train_data, test_data
        
    def predict(self, features: pd.DataFrame) -> Tuple[int, float]:
        """
        Predict the next day's direction and probability.
        Returns: (direction (1 for UP, 0 for DOWN), probability of that direction)
        """
        if self.model is None or self.feature_columns is None:
            raise ValueError("Model is not trained or loaded.")
            
        X = features[self.feature_columns]
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        return prediction, probabilities[prediction]
        
    def save_model(self, model_path: str):
        if self.model is None:
            raise ValueError("No model to save.")
        
        # Save model and metadata
        data = {
            "model": self.model,
            "feature_columns": self.feature_columns
        }
        
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(data, model_path)
        
    def load_model(self, model_path: str):
        data = joblib.load(model_path)
        self.model = data["model"]
        self.feature_columns = data["feature_columns"]

class HybridPredictor(PricePredictor):
    """
    Hybrid model combining technical features and LLM sentiment features.
    """
    pass
