import { useEffect, useState } from 'react';
import { CheckCircle2, Database, Info, RotateCcw, Server, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { checkBackend, API_ROOT } from '../services/api';

export function Settings() {
  const [backend, setBackend] = useState<boolean | null>(null);
  const [refreshOnAnalyze, setRefreshOnAnalyze] = useState(true);
  const [compactCharts, setCompactCharts] = useState(false);

  useEffect(() => {
    setRefreshOnAnalyze(localStorage.getItem('signalforge.refreshOnAnalyze') !== 'false');
    setCompactCharts(localStorage.getItem('signalforge.compactCharts') === 'true');
    checkBackend().then(setBackend);
  }, []);

  const updateRefresh = (value: boolean) => {
    setRefreshOnAnalyze(value);
    localStorage.setItem('signalforge.refreshOnAnalyze', String(value));
  };

  const updateCompact = (value: boolean) => {
    setCompactCharts(value);
    localStorage.setItem('signalforge.compactCharts', String(value));
  };

  const reset = () => {
    localStorage.removeItem('signalforge.refreshOnAnalyze');
    localStorage.removeItem('signalforge.compactCharts');
    setRefreshOnAnalyze(true);
    setCompactCharts(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Configuration</p>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted">Dashboard preferences and system status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Server size={18} className="text-primary" /> Backend Connection</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-background/60 p-4">
              <div>
                <p className="font-medium">API status</p>
                <p className="mt-1 text-xs text-muted">FastAPI service used by the dashboard</p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${backend ? 'bg-positive/10 text-positive' : backend === false ? 'bg-negative/10 text-negative' : 'bg-white/5 text-muted'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${backend ? 'bg-positive' : backend === false ? 'bg-negative' : 'bg-muted'}`} />
                {backend === null ? 'Checking' : backend ? 'Connected' : 'Unavailable'}
              </span>
            </div>
            <div className="rounded-lg border border-white/5 bg-background/60 p-4">
              <p className="text-xs text-muted">API host</p>
              <p className="mt-1 break-all font-mono text-sm text-white">{API_ROOT || 'http://localhost:8000'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Database size={18} className="text-primary" /> Active Dataset</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-white/5 bg-background/60 p-4">
              <p className="text-xs text-muted">Instrument</p>
              <p className="mt-1 text-lg font-semibold">NVIDIA Corporation <span className="text-sm font-normal text-muted">· NVDA</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/5 bg-background/60 p-4"><p className="text-xs text-muted">Data source</p><p className="mt-1 text-sm font-medium">Historical CSV</p></div>
              <div className="rounded-lg border border-white/5 bg-background/60 p-4"><p className="text-xs text-muted">Sentiment</p><p className="mt-1 text-sm font-medium">LLM scored</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Dashboard Preferences</CardTitle></CardHeader>
        <CardContent className="divide-y divide-white/5">
          <SettingRow title="Refresh on Analyze" description="Reload dashboard data when Analyze is pressed." enabled={refreshOnAnalyze} onChange={updateRefresh} />
          <SettingRow title="Compact chart layout" description="Use a tighter chart footprint on supported screens." enabled={compactCharts} onChange={updateCompact} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck size={18} className="text-positive" /> Safety & Methodology</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoRow icon={<CheckCircle2 size={17} />} text="No live trading or order execution is connected." />
          <InfoRow icon={<CheckCircle2 size={17} />} text="Evaluation uses an out-of-sample time split." />
          <InfoRow icon={<CheckCircle2 size={17} />} text="Price-only and hybrid models are compared." />
          <InfoRow icon={<Info size={17} />} text="Forecasts are educational and may be wrong." />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface px-4 py-2 text-sm text-muted transition hover:bg-surfaceHover hover:text-white">
          <RotateCcw size={15} /> Reset preferences
        </button>
      </div>
    </div>
  );
}

function SettingRow({ title, description, enabled, onChange }: { title: string; description: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted">{description}</p></div>
      <button type="button" aria-pressed={enabled} onClick={() => onChange(!enabled)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? 'bg-primary' : 'bg-white/10'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-background/50 p-4 text-sm text-muted"><span className="mt-0.5 text-positive">{icon}</span><span>{text}</span></div>;
}
