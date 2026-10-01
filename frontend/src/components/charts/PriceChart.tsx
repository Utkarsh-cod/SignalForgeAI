import { useState } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';

const ranges = ['1M', '3M', '6M', '1Y', 'ALL'] as const;
type Range = typeof ranges[number];

export function PriceChart({ data, loading }: { data: any[]; loading: boolean }) {
  const [range, setRange] = useState<Range>('3M');
  if (loading || !data?.length) return <Card className="h-[480px] flex items-center justify-center"><p className="text-sm text-muted">Loading chart data…</p></Card>;

  const limits: Record<Range, number> = { '1M': 21, '3M': 63, '6M': 126, '1Y': 252, 'ALL': data.length };
  const rows = data.slice(-limits[range]);
  const dates = rows.map(d => d.date);

  return <Card>
    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><CardTitle>Price & moving averages</CardTitle><p className="mt-1 text-xs text-muted">Candlesticks with SMA 20, 50 and 200.</p></div>
      <div className="flex w-max gap-1 rounded-lg border border-white/5 bg-background p-1">{ranges.map(r => <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${range === r ? 'bg-primary text-white' : 'text-muted hover:text-white'}`}>{r}</button>)}</div>
    </CardHeader>
    <CardContent className="h-[430px] p-0 sm:h-[460px]">
      <Plot
        data={[
          { x: dates, open: rows.map(d=>d.open), high: rows.map(d=>d.high), low: rows.map(d=>d.low), close: rows.map(d=>d.close), type:'candlestick', name:'Price', increasing:{line:{color:'#10B981'}}, decreasing:{line:{color:'#EF4444'}}, whiskerwidth:.5 },
          { x: dates, y: rows.map(d=>d.sma_20), type:'scatter', mode:'lines', line:{color:'#3B82F6',width:1.5}, name:'SMA 20', connectgaps:false },
          { x: dates, y: rows.map(d=>d.sma_50), type:'scatter', mode:'lines', line:{color:'#F59E0B',width:1.5}, name:'SMA 50', connectgaps:false },
          { x: dates, y: rows.map(d=>d.sma_200), type:'scatter', mode:'lines', line:{color:'#A78BFA',width:1.5,dash:'dot'}, name:'SMA 200', connectgaps:false },
        ]}
        layout={{ autosize:true, margin:{l:55,r:18,t:18,b:45}, paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)', font:{color:'#94A3B8',family:'Inter',size:11}, xaxis:{gridcolor:'rgba(255,255,255,.05)',type:'date',rangeslider:{visible:false},showspikes:true,spikemode:'across'}, yaxis:{gridcolor:'rgba(255,255,255,.05)',fixedrange:false}, showlegend:true, legend:{orientation:'h',y:1.08,x:0}, hovermode:'x unified' }}
        useResizeHandler style={{width:'100%',height:'100%'}} config={{displayModeBar:false,responsive:true}}
      />
    </CardContent>
  </Card>;
}
