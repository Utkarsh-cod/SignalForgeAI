import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, Newspaper, RefreshCw, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { fetchMarket, fetchPrediction, type MarketDataPoint, type PredictionData } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { PriceChart } from '../components/charts/PriceChart';
import { FinancialDisclaimer } from '../components/disclaimer/FinancialDisclaimer';

export function Overview() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [market, setMarket] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setError(null);
    setRefreshing(true);
    try {
      const [pred, prices] = await Promise.all([fetchPrediction(), fetchMarket()]);
      setPrediction(pred);
      setMarket(prices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('refresh_data', loadData);
    return () => window.removeEventListener('refresh_data', loadData);
  }, []);

  const latest = market.at(-1);
  const firstDate = market[0]?.date;
  const lastDate = latest?.date;
  const direction = prediction?.hybrid?.direction === 'UP';
  const probability = prediction?.hybrid?.probability ?? 0;
  const sentiment = prediction?.sentiment;
  const trendText = latest?.daily_return != null ? `${latest.daily_return >= 0 ? '+' : ''}${(latest.daily_return * 100).toFixed(2)}%` : '—';

  const healthItems = useMemo(() => [
    { label: 'Market data', value: market.length ? 'Loaded' : 'Pending', icon: Database },
    { label: 'LLM sentiment', value: sentiment ? 'Available' : 'Pending', icon: Newspaper },
    { label: 'Hybrid model', value: prediction?.hybrid ? 'Ready' : 'Pending', icon: Activity },
  ], [market.length, prediction?.hybrid, sentiment]);

  if (loading) return <OverviewSkeleton />;

  if (error) {
    return (
      <Card className="mx-auto max-w-4xl border-negative/20 bg-negative/5">
        <CardContent className="flex flex-col items-center p-12 text-center">
          <Activity size={42} className="mb-4 text-negative" />
          <h2 className="text-xl font-bold">Unable to load dashboard</h2>
          <p className="mt-2 max-w-md text-sm text-muted">{error}</p>
          <button onClick={loadData} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90">
            <RefreshCw size={15} /> Retry connection
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 animate-in fade-in duration-500">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Hybrid Stock Intelligence</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">NVIDIA <span className="text-muted">·</span> NVDA</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">Historical market features combined with LLM-derived news sentiment for an educational short-term direction forecast.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-positive" />
          Dataset {firstDate} <span className="text-white/30">→</span> {lastDate}
          <span className="ml-2 rounded-full border border-white/10 px-2 py-1">{market.length.toLocaleString()} rows</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="relative overflow-hidden border-primary/15 lg:col-span-8">
          <div className={`absolute -right-28 -top-28 h-72 w-72 rounded-full blur-3xl ${direction ? 'bg-positive' : 'bg-negative'} opacity-[0.07]`} />
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-8 md:flex-row">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Hybrid forecast
                </div>
                <div className="mt-5 flex items-center gap-4">
                  {direction ? <TrendingUp size={42} className="text-positive" /> : <TrendingDown size={42} className="text-negative" />}
                  <div>
                    <p className={`text-4xl font-bold ${direction ? 'text-positive' : 'text-negative'}`}>{direction ? 'UP' : 'DOWN'}</p>
                    <p className="mt-1 text-sm text-muted">Model probability <span className="font-semibold text-white">{(probability * 100).toFixed(1)}%</span></p>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-6 text-sm">
                  <div><p className="text-xs text-muted">Price-only model</p><p className="mt-1 font-semibold">{prediction?.baseline.direction} · {(prediction?.baseline.probability ?? 0) * 100 > 0 ? `${((prediction?.baseline.probability ?? 0) * 100).toFixed(1)}%` : '—'}</p></div>
                  <div><p className="text-xs text-muted">News sentiment</p><p className={`mt-1 font-semibold ${sentiment?.score && sentiment.score > 0 ? 'text-positive' : sentiment?.score && sentiment.score < 0 ? 'text-negative' : 'text-white'}`}>{sentiment ? `${sentiment.score > 0 ? '+' : ''}${sentiment.score.toFixed(2)} · ${(sentiment.confidence * 100).toFixed(0)}% conf.` : '—'}</p></div>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-background/60 p-5 md:min-w-44 md:self-start">
                <p className="text-xs text-muted">Latest close</p>
                <p className="mt-1 text-3xl font-bold">{latest ? `₹${latest.close.toFixed(2)}` : '—'}</p>
                <p className={`mt-1 text-sm font-medium ${latest?.daily_return && latest.daily_return >= 0 ? 'text-positive' : 'text-negative'}`}>{trendText} daily return</p>
                <p className="mt-4 text-[11px] text-muted">As of {prediction?.date ?? lastDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck size={18} className="text-positive" /> System readiness</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {healthItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-white/5 bg-background/50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-muted"><Icon size={16} />{label}</span>
                <span className="text-xs font-semibold text-white">{value}</span>
              </div>
            ))}
            <div className="rounded-lg border border-warning/15 bg-warning/5 px-4 py-3 text-xs leading-relaxed text-muted">
              Educational demonstration only. Forecasts are uncertain and are not investment advice.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Current Price" value={latest ? `₹${latest.close.toFixed(2)}` : '—'} sub={trendText + ' today'} />
        <Metric label="RSI (14)" value={latest?.rsi_14?.toFixed(2) ?? '—'} sub={latest?.rsi_14 != null && latest.rsi_14 > 70 ? 'Overbought zone' : latest?.rsi_14 != null && latest.rsi_14 < 30 ? 'Oversold zone' : 'Neutral momentum'} />
        <Metric label="20d Volatility" value={latest ? `${(latest.volatility_20 * 100).toFixed(2)}%` : '—'} sub="Historical daily volatility" />
        <Metric label="Volume Ratio" value={latest?.volume_ratio?.toFixed(2) ?? '—'} sub="vs 20-day average" />
      </div>

      <PriceChart data={market} loading={false} />
      <FinancialDisclaimer />
      {refreshing && <p className="text-center text-xs text-muted">Refreshing dashboard data…</p>}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <Card><CardContent className="p-5"><p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted">{sub}</p></CardContent></Card>;
}

function OverviewSkeleton() {
  return <div className="mx-auto max-w-[1500px] space-y-6"><div className="h-24 w-2/3 animate-pulse rounded-xl bg-white/5" /><div className="grid gap-6 lg:grid-cols-12"><Skeleton className="h-72 lg:col-span-8" /><Skeleton className="h-72 lg:col-span-4" /></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-[480px]" /></div>;
}
