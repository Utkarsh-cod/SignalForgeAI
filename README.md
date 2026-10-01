# SignalForge AI – Hybrid Stock Intelligence

An educational AI-powered stock analysis platform combining **technical indicators, LLM-based news sentiment, and machine learning** to generate directional stock insights.

> **Disclaimer:** SignalForge AI is an educational/research project. It does not provide financial advice, investment recommendations, or live trading.

## 🚀 Features

- 📈 Historical stock market analysis
- 📊 Technical indicator analysis
- 📰 LLM-based financial news sentiment analysis
- 🤖 Random Forest stock direction prediction
- 🔬 Baseline vs. hybrid model evaluation
- 📊 Model performance metrics
- 🔁 Historical backtesting
- 📉 Interactive Plotly visualizations
- 🖥️ React-based dashboard
- ⚡ FastAPI backend

## 🧠 Workflow

```text
Historical Market Data
        ↓
Technical Feature Engineering
        ↓
News Headlines → LLM Sentiment Analysis
        ↓
Technical + Sentiment Features
        ↓
Random Forest Model
        ↓
UP / DOWN Prediction + Probability
        ↓
Interactive Dashboard
```

## 📊 Model Features

### Technical Features — 12

- Daily Return
- SMA 20
- SMA 50
- SMA 200
- EMA 20
- EMA 50
- Volatility 20
- High-Low Range
- Volume Ratio
- RSI 14
- MACD
- MACD Signal

### Sentiment Features — 6

- Sentiment Mean
- Sentiment Standard Deviation
- News Count
- Positive Count
- Negative Count
- Neutral Count

**Total Hybrid Features: 18**

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Plotly |
| Backend | Python, FastAPI, Pydantic |
| ML & Data | Pandas, Scikit-learn, Random Forest |
| LLM | OpenRouter, Llama 3.3 70B Instruct |
| Storage | CSV, SQLite |

## 📁 Project Structure

```text
SignalForgeAI/
├── backend/
├── frontend/
├── data/
├── .gitignore
└── README.md
```

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Utkarsh-cod/SignalForgeAI.git
cd SignalForgeAI
```

### 2. Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Create a `.env` file and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Start the backend:

```powershell
$env:PYTHONPATH=".\backend"
uvicorn backend.app.main:app --reload
```

Backend:

`http://127.0.0.1:8000`

Health Check:

`http://127.0.0.1:8000/api/v1/health`

### 3. Frontend Setup

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

## 🔌 API Endpoints

| Endpoint | Description |
|---|---|
| `/api/v1/health` | Backend health check |
| `/api/v1/stock/NVDA/market` | Market data |
| `/api/v1/stock/NVDA/prediction` | Direction prediction |
| `/api/v1/stock/NVDA/news` | News data |
| `/api/v1/stock/NVDA/sentiment` | AI sentiment analysis |
| `/api/v1/stock/NVDA/evaluation` | Model evaluation |
| `/api/v1/stock/NVDA/backtest` | Historical backtesting |

## 📈 Current Demonstration

The current demonstration uses **NVIDIA (NVDA)** with historical market data and a demonstration news dataset.

The system compares a technical/price-based baseline model with a hybrid model incorporating news sentiment features.

## 🔮 Future Scope

- Multi-stock support
- Real-time market and news data
- Additional financial news sources
- Advanced machine learning models
- Improved sentiment aggregation
- Explainable AI
- Cloud deployment

## 👨‍💻 Author

**Utkarsh Agarwal**  
B.Tech CSE (AI & ML)  
ABES Engineering College, Ghaziabad

**Project ID:** P_100

---

> **SignalForge AI** — Market Data + News → AI-Driven Stock Intelligence