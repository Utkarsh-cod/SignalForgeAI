const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_ROOT = API_BASE.replace(/\/api\/v1\/?$/, '');

export interface PredictionData {
  ticker: string;
  date: string;
  price: number;
  baseline: { direction: string; probability: number };
  hybrid?: { direction: string; probability: number };
  sentiment: { score: number; confidence: number };
  warning?: string;
}

export interface EvaluationMetrics {
  accuracy: number;
  f1: number;
  precision: number;
  recall: number;
  directional_accuracy: number;
  confusion_matrix: number[][];
  feature_importance?: Record<string, number>;
}

export interface BacktestData {
  cumulative_return: number;
  benchmark_return: number;
  win_rate: number;
  num_signals: number;
  max_drawdown: number;
  timeseries?: Array<{ date: string; cum_strategy: number; cum_benchmark: number }>;
}

export interface EvaluationData {
  baseline: EvaluationMetrics;
  hybrid: EvaluationMetrics;
  backtest: BacktestData;
}

export interface MarketDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  ema_20?: number;
  ema_50?: number;
  rsi_14: number;
  macd?: number;
  macd_signal?: number;
  volatility_20: number;
  volume_ratio: number;
  daily_return: number;
  market_cap?: number;
}

export interface NewsItem {
  date: string;
  headline: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  sentiment_confidence: number;
}

async function requestResult<T>(url: string, message: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${message} (${res.status})`);
  }
  const data = await res.json();
  return data.result as T;
}

export function fetchPrediction(ticker = 'NVDA'): Promise<PredictionData> {
  return requestResult(`${API_BASE}/stock/${ticker}/prediction`, 'Failed to fetch prediction');
}

export function fetchEvaluation(ticker = 'NVDA'): Promise<EvaluationData> {
  return requestResult(`${API_BASE}/stock/${ticker}/evaluation`, 'Failed to fetch evaluation');
}

export function fetchMarket(ticker = 'NVDA'): Promise<MarketDataPoint[]> {
  return requestResult(`${API_BASE}/stock/${ticker}/market`, 'Failed to fetch market data');
}

export function fetchNews(ticker = 'NVDA'): Promise<NewsItem[]> {
  return requestResult(`${API_BASE}/stock/${ticker}/news`, 'Failed to fetch news');
}

export async function checkBackend(): Promise<boolean> {
  const candidates = [`${API_ROOT}/health`, `${API_BASE}/health`];
  for (const url of candidates) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (response.ok) return true;
    } catch {
      // Try the next known health endpoint.
    }
  }
  return false;
}
