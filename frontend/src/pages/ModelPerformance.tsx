import { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { AlertTriangle, BarChart3, CheckCircle2 } from 'lucide-react';
import { fetchEvaluation, type EvaluationData } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { FinancialDisclaimer } from '../components/disclaimer/FinancialDisclaimer';

const technical = ['daily_return','sma_20','sma_50','sma_200','ema_20','ema_50','volatility_20','high_low_range','volume_ratio','rsi_14','macd','macd_signal'];
const sentiment = ['sentiment_mean','sentiment_std','news_count','positive_count','negative_count','neutral_count'];

export function ModelPerformance() {
  const [data,setData]=useState<EvaluationData|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=()=>{setLoading(true);setError(null);fetchEvaluation().then(setData).catch(e=>setError(e instanceof Error?e.message:'Failed to load evaluation.')).finally(()=>setLoading(false));};
  useEffect(()=>{load();window.addEventListener('refresh_data',load);return()=>window.removeEventListener('refresh_data',load)},[]);
  const importance=useMemo(()=>data?.hybrid.feature_importance?Object.entries(data.hybrid.feature_importance).sort((a,b)=>b[1]-a[1]):[],[data]);
  if(loading)return <Skeleton className="h-[700px] w-full"/>;
  if(error)return <Card className="border-negative/20 bg-negative/5"><CardContent className="p-10 text-center"><h3 className="font-semibold">Evaluation unavailable</h3><p className="mt-2 text-sm text-muted">{error}</p><button onClick={load} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold">Retry</button></CardContent></Card>;
  if(!data)return null; const {baseline,hybrid}=data;
  const rows=[['Accuracy',baseline.accuracy,hybrid.accuracy,true],['F1 Score',baseline.f1,hybrid.f1,false],['Precision',baseline.precision,hybrid.precision,true],['Recall',baseline.recall,hybrid.recall,true],['Directional Accuracy',baseline.directional_accuracy,hybrid.directional_accuracy,true]] as const;
  const splitDate='2024-03-01';
  const sentimentUsed=importance.filter(([name])=>sentiment.includes(name)).some(([,v])=>Math.abs(v)>0);
  return <div className="mx-auto max-w-[1500px] space-y-6 animate-in fade-in duration-500">
    <div><p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-primary">Evaluation</p><h2 className="text-2xl font-bold">Model Performance</h2><p className="mt-1 text-sm text-muted">Out-of-sample comparison of the price-only baseline and hybrid feature set.</p></div>
    <div className="grid gap-4 md:grid-cols-3"><InfoCard label="Training period" value={`1999-01-22 → ${splitDate}`} /><InfoCard label="Test period" value={`${new Date(new Date(splitDate).getTime()+86400000).toISOString().slice(0,10)} → 2026-03-11`} /><InfoCard label="Feature set" value={`${technical.length} technical + ${sentiment.length} sentiment`} /></div>
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-7"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={18} className="text-primary"/> Baseline vs hybrid metrics</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-muted"><tr><th className="pb-3">Metric</th><th className="pb-3 text-right">Price only</th><th className="pb-3 text-right">Hybrid</th><th className="pb-3 text-right">Δ</th></tr></thead><tbody className="divide-y divide-white/5">{rows.map(([label,a,b,pct])=><tr key={label}><td className="py-4 font-medium">{label}</td><td className="py-4 text-right">{pct?(a*100).toFixed(2)+'%':a.toFixed(4)}</td><td className="py-4 text-right">{pct?(b*100).toFixed(2)+'%':b.toFixed(4)}</td><td className={`py-4 text-right font-semibold ${b-a>0?'text-positive':b-a<0?'text-negative':'text-muted'}`}>{pct?`${b-a>0?'+':''}${((b-a)*100).toFixed(2)}pp`: `${b-a>0?'+':''}${(b-a).toFixed(4)}`}</td></tr>)}</tbody></table></div></CardContent></Card>
      <Card className="lg:col-span-5"><CardHeader><CardTitle>Hybrid confusion matrix</CardTitle></CardHeader><CardContent className="flex items-center justify-center p-6"><div className="grid w-full max-w-sm grid-cols-3 gap-2 text-center text-xs"><div/><div className="text-muted">Pred Down</div><div className="text-muted">Pred Up</div><div className="flex items-center justify-end pr-2 text-muted">Act Down</div><Cell value={hybrid.confusion_matrix[0][0]} strong/><Cell value={hybrid.confusion_matrix[0][1]}/><div className="flex items-center justify-end pr-2 text-muted">Act Up</div><Cell value={hybrid.confusion_matrix[1][0]}/><Cell value={hybrid.confusion_matrix[1][1]} strong/></div></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Feature importance</CardTitle></CardHeader><CardContent className="h-[430px] p-0"><Plot data={[{x:importance.map(([k])=>k),y:importance.map(([,v])=>v),type:'bar',marker:{color:'#3B82F6'}}]} layout={{autosize:true,margin:{l:50,r:20,t:20,b:105},paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',font:{color:'#94A3B8',family:'Inter',size:11},xaxis:{tickangle:-45},yaxis:{gridcolor:'rgba(255,255,255,.05)'}}} useResizeHandler style={{width:'100%',height:'100%'}} config={{displayModeBar:false}}/></CardContent></Card>
    <Card className={`${sentimentUsed?'border-positive/15':'border-warning/15'} ${sentimentUsed?'bg-positive/5':'bg-warning/5'}`}><CardContent className="flex items-start gap-3 p-5">{sentimentUsed?<CheckCircle2 className="mt-0.5 text-positive" size={19}/>:<AlertTriangle className="mt-0.5 text-warning" size={19}/>}<div><p className="font-semibold">{sentimentUsed?'Sentiment features contribute to the trained model.':'Current hybrid run assigns zero feature importance to the six sentiment features.'}</p><p className="mt-1 text-sm leading-relaxed text-muted">This is consistent with the current demonstration dataset: its generated headlines are not constructed with a predictive relationship to the future target. The UI reports the measured result rather than hiding it.</p></div></CardContent></Card>
    <FinancialDisclaimer />
  </div>;
}
function InfoCard({label,value}:{label:string;value:string}){return <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-sm font-semibold leading-relaxed">{value}</p></CardContent></Card>}
function Cell({value,strong=false}:{value:number;strong?:boolean}){return <div className={`rounded-lg border border-white/5 p-5 text-xl ${strong?'bg-surfaceHover font-bold':'bg-background/40 font-semibold'}`}>{value}</div>}
