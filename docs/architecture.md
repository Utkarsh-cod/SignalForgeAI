# Architecture

The P_100 Hybrid Stock Intelligence system uses a decoupled architecture.

## 1. Backend (FastAPI)
The backend operates as an API server and model orchestrator.
- **Routers** (`app/api/routes/`): Modular API endpoints for health, stocks, predictions, news, and evaluation.
- **Engines** (`app/engines/`):
  - `data_loader.py`: Handles CSV parsing and date formatting.
  - `features.py`: Computes SMA, RSI, MACD, Volatility.
  - `sentiment_llm.py`: Interfaces with OpenRouter LLM, handles caching (SQLite), and parses JSON output.
  - `model_trainer.py`: Trains the Scikit-learn RandomForest classifier.
  - `backtester.py`: Calculates cumulative hypothetical returns based on predictions.
- **Schemas** (`app/api/schemas.py`): Strict Pydantic models for request/response validation.

## 2. Frontend (React/Vite)
A modern Single Page Application (SPA) utilizing:
- **Tailwind CSS**: For utility-first styling.
- **Plotly.js**: For interactive financial charting (candlesticks, timeseries).
- **Lucide React**: For scalable vector icons.
- **Services**: API interaction layer configured via `.env`.

## 3. Storage
- **Models**: Scikit-learn models are pickled and stored in `models/`.
- **Cache**: News sentiment is cached locally in an SQLite database (`p100_cache.db`) to reduce LLM API calls and latency.
