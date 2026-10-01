import { useEffect, useState } from 'react';
import { Activity, ArrowRight, BrainCircuit, LineChart, Newspaper, TrendingDown, TrendingUp } from 'lucide-react';
import { fetchPrediction, type PredictionData } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { FinancialDisclaimer } from '../components/disclaimer/FinancialDisclaimer';

export function Prediction() {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => { setLoading(true); setError(null); fetchPrediction().then(setData).catch(e=>setError(e instanceof Error?e.message:'Failed to load prediction.')).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); window.addEventListener('refresh_data',load); return()=>window.removeEventListener('refresh_data',load); },[]);

  if (loading) return <div className="mx-auto max-w-6xl space-y-6"><Skeleton className="h-72"/><div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-52"/><Skeleton className="h-52"/></div><Skeleton className="h-36"/></div>;
  if (error) return <Card className="border-negative/20 bg-negative/5"><CardContent className="p-10 text-center"><Activity className="mx-auto mb-3 text-negative"/><h3 className="font-semibold">Prediction unavailable</h3><p className="mt-2 text-sm text-muted">{error}</p><button onClick={load} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold">Retry</button></CardContent></Card>;
  if (!data) return null;

  const hybrid = data.hybrid ?? data.baseline;
  const isUp = hybrid.direction === 'UP';
  const sentimentLabel = data.sentiment.score > 0 ? 'Positive' : data.sentiment.score < 0 ? 'Negative' : 'Neutral';

  return <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
    <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Forecast engine</p><h2 className="text-2xl font-bold">Hybrid Prediction</h2><p className="mt-1 text-sm text-muted">A technical model paired with LLM-derived news sentiment.</p></div>

    <Card className="relative overflow-hidden border-primary/15">
      <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl ${isUp?'bg-positive':'bg-negative'} opacity-[.08]`} />
      <CardContent className="relative p-7 sm:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted">Final forecast</p>
            <div className="mt-4 flex items-center gap-4">{isUp?<TrendingUp size={52} className="text-positive"/>:<TrendingDown size={52} className="text-negative"/>}<div><p className={`text-5xl font-bold ${isUp?'text-positive':'text-negative'}`}>{isUp?'UP':'DOWN'}</p><p className="mt-1 text-sm text-muted">Direction for the model's forecast horizon</p></div></div>
          </div>
          <div className="rounded-xl border border-white/5 bg-background/60 px-7 py-5 text-left md:min-w-48 md:text-right"><p className="text-xs text-muted">Model probability</p><p className="mt-1 text-4xl font-bold">{(hybrid.probability*100).toFixed(1)}%</p><p className="mt-1 text-xs text-muted">As of {data.date}</p></div>
        </div>
        <div className="mt-8 grid gap-3 border-t border-white/5 pt-6 sm:grid-cols-3"><Stat label="Current price" value={`₹${data.price.toFixed(2)}`} /><Stat label="Price-only signal" value={`${data.baseline.direction} · ${(data.baseline.probability*100).toFixed(1)}%`} /><Stat label="News sentiment" value={`${sentimentLabel} · ${data.sentiment.score>0?'+':''}${data.sentiment.score.toFixed(2)}`} /></div>
      </CardContent>
    </Card>

    <div className="grid gap-6 md:grid-cols-2">
      <ModelCard icon={<LineChart className="text-primary"/>} title="Price-only model" rows={[['Algorithm','Random Forest'],['Signal',data.baseline.direction],['Probability',`${(data.baseline.probability*100).toFixed(1)}%`],['Inputs','12 technical features']]} />
      <ModelCard icon={<Newspaper className="text-primary"/>} title="LLM sentiment" rows={[['Overall sentiment',sentimentLabel],['Aggregate score',`${data.sentiment.score>0?'+':''}${data.sentiment.score.toFixed(2)}`],['LLM confidence',`${(data.sentiment.confidence*100).toFixed(0)}%`],['Role','Daily news feature input']]} />
    </div>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit size={19} className="text-primary"/> Hybrid architecture</CardTitle></CardHeader><CardContent className="overflow-x-auto p-6"><div className="flex min-w-[920px] items-center gap-2 text-center text-xs font-semibold">
      {['Market data','Technical features','Price model'].map((label,i)=><div key={label} className={`flex items-center gap-2 ${i===2?'text-primary':''}`}><div className="rounded-lg border border-white/5 bg-surface px-4 py-3">{label}</div>{i<2&&<ArrowRight size={15} className="text-muted"/>}</div>)}
      <span className="px-1 text-lg text-muted">+</span>
      {['News','LLM sentiment','Daily aggregation','Hybrid model','Forecast'].map((label,i)=><div key={label} className={`flex items-center gap-2 ${label==='Hybrid model'?'text-primary':''}`}><div className={`rounded-lg border px-4 py-3 ${label==='Hybrid model'?'border-primary/30 bg-primary/10':'border-white/5 bg-surface'}`}>{label}</div>{i<4&&<ArrowRight size={15} className="text-muted"/>}</div>)}
    </div></CardContent></Card>
    <FinancialDisclaimer />
  </div>;
}

function Stat({label,value}:{label:string;value:string}){return <div><p className="text-xs text-muted">{label}</p><p className="mt-1 font-semibold">{value}</p></div>}
function ModelCard({icon,title,rows}:{icon:React.ReactNode;title:string;rows:string[][]}){return <Card><CardHeader><CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle></CardHeader><CardContent className="space-y-4">{rows.map(([a,b])=><div key={a} className="flex items-center justify-between gap-4 text-sm"><span className="text-muted">{a}</span><span className="text-right font-medium">{b}</span></div>)}</CardContent></Card>}
