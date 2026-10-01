import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { BarChart3, Info } from 'lucide-react';
import { fetchEvaluation, type EvaluationData } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { FinancialDisclaimer } from '../components/disclaimer/FinancialDisclaimer';

export function Backtest(){
  const [data,setData]=useState<EvaluationData|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState<string|null>(null);
  const load=()=>{setLoading(true);setError(null);fetchEvaluation().then(setData).catch(e=>setError(e instanceof Error?e.message:'Failed to load backtest.')).finally(()=>setLoading(false));};
  useEffect(()=>{load();window.addEventListener('refresh_data',load);return()=>window.removeEventListener('refresh_data',load)},[]);
  if(loading)return <Skeleton className="h-[700px] w-full"/>;
  if(error)return <Card className="border-negative/20 bg-negative/5"><CardContent className="p-10 text-center"><h3 className="font-semibold">Backtest unavailable</h3><p className="mt-2 text-sm text-muted">{error}</p><button onClick={load} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold">Retry</button></CardContent></Card>;
  if(!data)return null;const b=data.backtest;const ts=b.timeseries??[];
  return <div className="mx-auto max-w-[1500px] space-y-6 animate-in fade-in duration-500">
    <div><p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-primary">Historical simulation</p><h2 className="text-2xl font-bold">Backtest</h2><p className="mt-1 text-sm text-muted">Hypothetical historical simulation of the configured strategy. It does not execute trades.</p></div>
    <Card className="border-warning/15 bg-warning/5"><CardContent className="flex items-start gap-3 p-4 text-sm text-muted"><Info size={18} className="mt-0.5 shrink-0 text-warning"/><span>Results depend on the supplied historical data, model, assumptions and time split. They should not be interpreted as a guarantee of future performance.</span></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-3"><Metric label="Strategy return" value={`${(b.cumulative_return*100).toFixed(2)}%`} sub={`Benchmark ${(b.benchmark_return*100).toFixed(2)}%`}/><Metric label="Signal win rate" value={`${(b.win_rate*100).toFixed(2)}%`} sub={`${b.num_signals} signals`}/><Metric label="Maximum drawdown" value={`${(b.max_drawdown*100).toFixed(2)}%`} sub="Peak-to-trough loss"/></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={18} className="text-primary"/> Strategy vs benchmark</CardTitle></CardHeader><CardContent className="h-[480px] p-0">{ts.length?<Plot data={[{x:ts.map(x=>x.date),y:ts.map(x=>(x.cum_strategy-1)*100),type:'scatter',mode:'lines',name:'Hybrid strategy',line:{color:'#10B981',width:2}},{x:ts.map(x=>x.date),y:ts.map(x=>(x.cum_benchmark-1)*100),type:'scatter',mode:'lines',name:'Buy & hold benchmark',line:{color:'#64748B',width:2,dash:'dot'}}]} layout={{autosize:true,margin:{l:55,r:20,t:20,b:45},paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',font:{color:'#94A3B8',family:'Inter',size:11},xaxis:{type:'date',gridcolor:'rgba(255,255,255,.05)'},yaxis:{title:'Cumulative return (%)',gridcolor:'rgba(255,255,255,.05)',zerolinecolor:'rgba(255,255,255,.2)'},legend:{orientation:'h',y:1.08,x:0}}} useResizeHandler style={{width:'100%',height:'100%'}} config={{displayModeBar:false}}/>:<div className="flex h-full items-center justify-center text-sm text-muted">Timeseries data not available.</div>}</CardContent></Card>
    <FinancialDisclaimer />
  </div>;
}
function Metric({label,value,sub}:{label:string;value:string;sub:string}){return <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted">{sub}</p></CardContent></Card>}
