from pathlib import Path
from typing import Dict, Any

import pandas as pd

from app.engines.data_loader import load_price_data
from app.engines.features import generate_technical_features
from app.engines.sentiment_aggregator import aggregate_daily_sentiment
from app.engines.predictor import PricePredictor
from app.engines.evaluator import evaluate_model
from app.engines.backtester import run_backtest


class ForecastService:
    def __init__(
        self,
        data_dir: str | None = None,
        models_dir: str | None = None,
    ):
        """
        Initialize the forecasting service.

        Paths are resolved relative to the project root so that the
        application works regardless of the directory from which
        Uvicorn is started.

        Project structure expected:

        P_100/
        ├── backend/
        ├── data/
        ├── models/
        └── ...
        """

        # forecast_service.py
        # P_100/backend/app/services/forecast_service.py
        #
        # parents[0] = services
        # parents[1] = app
        # parents[2] = backend
        # parents[3] = P_100
        project_root = Path(__file__).resolve().parents[3]

        self.data_dir = (
            Path(data_dir).resolve()
            if data_dir
            else project_root / "data"
        )

        self.models_dir = (
            Path(models_dir).resolve()
            if models_dir
            else project_root / "models"
        )

    # ---------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------

    def _price_data_path(self) -> Path:
        return self.data_dir / "nvidia_stock_data_1999_2026.csv"

    def _news_data_path(self) -> Path:
        return self.data_dir / "news_with_sentiment.csv"

    def _price_model_path(self) -> Path:
        return self.models_dir / "price_model.pkl"

    def _hybrid_model_path(self) -> Path:
        return self.models_dir / "hybrid_model.pkl"

    @staticmethod
    def _sentiment_columns() -> list[str]:
        return [
            "sentiment_mean",
            "sentiment_std",
            "news_count",
            "positive_count",
            "negative_count",
            "neutral_count",
            "confidence_mean",
        ]

    @staticmethod
    def _hybrid_feature_names(feature_cols: list[str]) -> list[str]:
        return feature_cols + [
            "sentiment_mean",
            "sentiment_std",
            "news_count",
            "positive_count",
            "negative_count",
            "neutral_count",
        ]

    def _load_market_features(self):
        """Load historical price data and generate technical features."""

        data_path = self._price_data_path()

        if not data_path.exists():
            raise FileNotFoundError(
                f"Stock dataset not found: {data_path}"
            )

        df = load_price_data(str(data_path))
        df, feature_cols = generate_technical_features(df)

        return df, feature_cols

    def _merge_sentiment(
        self,
        df: pd.DataFrame,
        feature_cols: list[str],
    ):
        """
        Merge daily sentiment data with market data.

        Returns:
            merged dataframe,
            hybrid feature names,
            whether news data exists
        """

        news_path = self._news_data_path()

        if not news_path.exists():
            return df, feature_cols, False

        news_df = pd.read_csv(news_path)

        if news_df.empty:
            return df, feature_cols, False

        daily_sentiment = aggregate_daily_sentiment(news_df)

        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])

        daily_sentiment = daily_sentiment.copy()
        daily_sentiment["date"] = pd.to_datetime(
            daily_sentiment["date"]
        )

        df = pd.merge(
            df,
            daily_sentiment,
            on="date",
            how="left",
        )

        # Missing sentiment means no news was available for that date.
        # For model features, use neutral/zero values.
        for column in self._sentiment_columns():
            if column not in df.columns:
                df[column] = 0.0

            df[column] = df[column].fillna(0.0)

        hybrid_features = self._hybrid_feature_names(feature_cols)

        return df, hybrid_features, True

    # ---------------------------------------------------------
    # Forecast
    # ---------------------------------------------------------

    def get_forecast(self, ticker: str = "NVDA") -> Dict[str, Any]:
        """
        Generate the latest stock-direction forecast.

        The system:
        1. Loads historical market data.
        2. Generates technical features.
        3. Loads daily sentiment.
        4. Runs the price-only baseline model.
        5. Runs the hybrid technical + sentiment model.
        """

        ticker = ticker.upper()

        # Current implementation uses the NVIDIA dataset.
        if ticker != "NVDA":
            raise ValueError(
                f"Ticker '{ticker}' is not supported. "
                "The current dataset is NVIDIA (NVDA)."
            )

        # 1. Market data + technical features
        df, feature_cols = self._load_market_features()

        # 2. Add sentiment features
        df, hybrid_features, has_news = self._merge_sentiment(
            df,
            feature_cols,
        )

        if df.empty:
            raise ValueError("No market data available.")

        # Remove rows where technical features are unavailable.
        usable_df = df.dropna(subset=feature_cols).copy()

        if usable_df.empty:
            raise ValueError(
                "Insufficient historical data to generate features."
            )

        # Latest usable row
        latest_row = usable_df.iloc[[-1]].copy()

        latest_date = pd.to_datetime(
            latest_row["date"].iloc[0]
        ).strftime("%Y-%m-%d")

        current_price = float(
            latest_row["close"].iloc[0]
        )

        # -----------------------------------------------------
        # Baseline model
        # -----------------------------------------------------

        baseline_model_path = self._price_model_path()

        if not baseline_model_path.exists():
            raise FileNotFoundError(
                f"Price model not found: {baseline_model_path}"
            )

        baseline_predictor = PricePredictor(
            model_path=str(baseline_model_path)
        )

        base_dir, base_prob = baseline_predictor.predict(
            latest_row
        )

        # -----------------------------------------------------
        # Sentiment
        # -----------------------------------------------------

        sentiment_score = 0.0
        sentiment_conf = 0.0

        if has_news:
            if "sentiment_mean" in latest_row.columns:
                sentiment_score = float(
                    latest_row["sentiment_mean"].iloc[0]
                )

            if "confidence_mean" in latest_row.columns:
                sentiment_conf = float(
                    latest_row["confidence_mean"].iloc[0]
                )

        # -----------------------------------------------------
        # Hybrid model
        # -----------------------------------------------------

        hybrid_result = None

        hybrid_model_path = self._hybrid_model_path()

        if has_news and hybrid_model_path.exists():

            hybrid_predictor = PricePredictor(
                model_path=str(hybrid_model_path)
            )

            hyb_dir, hyb_prob = hybrid_predictor.predict(
                latest_row
            )

            hybrid_result = {
                "direction": (
                    "UP" if hyb_dir == 1 else "DOWN"
                ),
                "probability": float(hyb_prob),
            }

        result = {
            "ticker": ticker,
            "date": latest_date,
            "price": current_price,
            "baseline": {
                "direction": (
                    "UP" if base_dir == 1 else "DOWN"
                ),
                "probability": float(base_prob),
            },
            "sentiment": {
                "score": sentiment_score,
                "confidence": sentiment_conf,
            },
            "warning": (
                "Educational forecast only. "
                "Not financial or investment advice."
            ),
        }

        if hybrid_result is not None:
            result["hybrid"] = hybrid_result

        return result

    # ---------------------------------------------------------
    # Evaluation
    # ---------------------------------------------------------

    def get_evaluation(self) -> Dict[str, Any]:
        """
        Evaluate the price-only and hybrid models using
        chronological test data.
        """

        df, feature_cols = self._load_market_features()

        # -----------------------------------------------------
        # Baseline
        # -----------------------------------------------------

        baseline_model_path = self._price_model_path()

        if not baseline_model_path.exists():
            raise FileNotFoundError(
                f"Price model not found: {baseline_model_path}"
            )

        bp = PricePredictor(
            model_path=str(baseline_model_path)
        )

        _, _, test_data = bp.train(
            df,
            feature_cols,
        )

        base_metrics = evaluate_model(
            bp,
            test_data,
            feature_cols,
        )

        # -----------------------------------------------------
        # Hybrid
        # -----------------------------------------------------

        df_hybrid, hybrid_features, has_news = self._merge_sentiment(
            df,
            feature_cols,
        )

        hybrid_metrics = None
        backtest = None

        if has_news:

            hybrid_model_path = self._hybrid_model_path()

            if hybrid_model_path.exists():

                hp = PricePredictor(
                    model_path=str(hybrid_model_path)
                )

                _, _, hybrid_test_data = hp.train(
                    df_hybrid,
                    hybrid_features,
                )

                hybrid_metrics = evaluate_model(
                    hp,
                    hybrid_test_data,
                    hybrid_features,
                )

                predictions = hp.model.predict(
                    hybrid_test_data[hybrid_features]
                )

                backtest = run_backtest(
                    hybrid_test_data,
                    predictions,
                )

        # Fallback backtest using baseline
        if backtest is None:

            predictions = bp.model.predict(
                test_data[feature_cols]
            )

            backtest = run_backtest(
                test_data,
                predictions,
            )

        return {
            "baseline": base_metrics,
            "hybrid": hybrid_metrics,
            "backtest": backtest,
        }

       # ---------------------------------------------------------
    # Market Data
    # ---------------------------------------------------------

    def get_market_data(self) -> list:
        """Return historical market data for the dashboard."""

        df, _ = self._load_market_features()

        recent = df.copy()

        recent["date"] = pd.to_datetime(
            recent["date"]
        ).dt.strftime("%Y-%m-%d")

        # Convert to object dtype first so that missing
        # pandas/NumPy values become real Python None.
        # This prevents JSON serialization errors caused by NaN.
        recent = recent.astype(object).where(
            pd.notnull(recent),
            None
        )

        return recent.to_dict(
            orient="records"
        )

    def get_news(self) -> list:
        """Return the latest available news with sentiment."""

        news_path = self._news_data_path()

        if not news_path.exists():
            return []

        df = pd.read_csv(news_path)

        if df.empty:
            return []

        if "date" in df.columns:
            df["date"] = pd.to_datetime(
                df["date"],
                errors="coerce",
            )

            df = df.sort_values(
                "date",
                ascending=False,
            ).head(50)

            df["date"] = df["date"].dt.strftime(
                "%Y-%m-%d"
            )

        df = df.where(
            pd.notnull(df),
            None,
        )

        return df.to_dict(
            orient="records"
        )