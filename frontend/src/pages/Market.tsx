import { useEffect, useState } from 'react';
import { fetchMarket, type MarketDataPoint } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { PriceChart } from '../components/charts/PriceChart';

export function Market() {
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true); setError(null);
    fetchMarket().then(setData).catch(e => setError(e instanceof Error ? e.message : 'Failed to load market data.')).finally(() => setLoading(false));
  };
  useEffect(() => { loadData(); window.addEventListener('refresh_data', loadData); return () => window.removeEventListener('refresh_data', loadData); }, []);

  if (loading) return <div className="space-y-6"><Skeleton className="h-[500px]" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />)}</div></div>;
  if (error) return <ErrorCard message={error} onRetry={loadData} />;
  const latest = data.at(-1);
  if (!latest) return null;

  return <div className="mx-auto max-w-[1500px] space-y-6 animate-in fade-in duration-500">
    <PageHeading title="Market Data & Technicals" subtitle="Historical price action, moving averages and technical indicators." />
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-white/5 bg-surface p-5">
      <div><p className="text-xs uppercase tracking-wider text-muted">Latest close</p><p className="mt-1 text-3xl font-bold">₹{latest.close.toFixed(2)}</p></div>
      <div className="text-right"><p className={`text-lg font-semibold ${latest.daily_return >= 0 ? 'text-positive' : 'text-negative'}`}>{latest.daily_return >= 0 ? '+' : ''}{(latest.daily_return * 100).toFixed(2)}%</p><p className="text-xs text-muted">{latest.date}</p></div>
    </div>
    <PriceChart data={data} loading={false} />
    <section><div className="mb-3"><h3 className="text-lg font-semibold">Technical indicators</h3><p className="text-xs text-muted">Values from the latest available market row.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Daily Return" value={`${latest.daily_return >= 0 ? '+' : ''}${(latest.daily_return * 100).toFixed(2)}%`} />
        <Metric label="MACD" value={latest.macd?.toFixed(2) ?? '—'} />
        <Metric label="RSI (14)" value={latest.rsi_14?.toFixed(2) ?? '—'} />
        <Metric label="20d Volatility" value={`${(latest.volatility_20 * 100).toFixed(2)}%`} />
        <Metric label="Volume Ratio" value={latest.volume_ratio?.toFixed(2) ?? '—'} />
        <Metric label="SMA 50 / 200" value={latest.sma_200 ? (latest.sma_50 / latest.sma_200).toFixed(2) : '—'} />
      </div>
    </section>
    <Card><CardHeader><CardTitle>Recent OHLC data</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-muted"><tr>{['Date','Open','High','Low','Close','Volume'].map(h=><th key={h} className="pb-3 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{data.slice(-8).reverse().map(row=><tr key={row.date} className="hover:bg-white/[0.025]"><td className="py-3 text-muted">{row.date}</td><td className="py-3">₹{row.open.toFixed(2)}</td><td className="py-3">₹{row.high.toFixed(2)}</td><td className="py-3">₹{row.low.toFixed(2)}</td><td className="py-3 font-semibold">₹{row.close.toFixed(2)}</td><td className="py-3 text-right">{row.volume.toLocaleString()}</td></tr>)}</tbody></table></div></CardContent></Card>
  </div>;
}

function PageHeading({ title, subtitle }: { title: string; subtitle: string }) { return <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Market workspace</p><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-muted">{subtitle}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <Card><CardContent className="p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></CardContent></Card>; }
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) { return <Card className="border-negative/20 bg-negative/5"><CardContent className="p-10 text-center"><h3 className="font-semibold">Unable to load market data</h3><p className="mt-2 text-sm text-muted">{message}</p><button onClick={onRetry} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold">Retry</button></CardContent></Card>; }
