import { Card, CardContent } from '../common/Card';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

export function PredictionCard({ data, loading }: { data: any; loading: boolean }) {
  if (loading) return <Card className="h-full"><CardContent className="p-8"><Skeleton className="h-5 w-32"/><Skeleton className="mt-5 h-12 w-48"/><Skeleton className="mt-8 h-10 w-80"/></CardContent></Card>;
  if (!data) return null;
  const {price,hybrid,baseline,sentiment,date}=data; const up=hybrid.direction==='UP';
  return <Card className="relative h-full overflow-hidden border-primary/15"><div className={`absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl ${up?'bg-positive':'bg-negative'} opacity-[.07]`}/><CardContent className="relative p-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted">Hybrid forecast</p><div className="mt-4 flex items-center gap-3">{up?<TrendingUp className="text-positive" size={34}/>:<TrendingDown className="text-negative" size={34}/>}<span className={`text-4xl font-bold ${up?'text-positive':'text-negative'}`}>{up?'UP':'DOWN'}</span><span className="text-2xl font-semibold text-white">{(hybrid.probability*100).toFixed(1)}%</span></div><div className="mt-7 grid grid-cols-2 gap-5 text-sm"><div><p className="text-xs text-muted">Price model</p><p className="mt-1 font-semibold">{baseline.direction} · {(baseline.probability*100).toFixed(1)}%</p></div><div><p className="text-xs text-muted">AI sentiment</p><p className="mt-1 font-semibold">{sentiment.score>0?'+':''}{sentiment.score.toFixed(2)}</p></div></div><div className="mt-7 flex items-center gap-2 text-xs text-muted"><Clock size={14}/> Updated {date} · ₹{price.toFixed(2)}</div></CardContent></Card>;
}
