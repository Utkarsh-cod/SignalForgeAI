import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  LineChart,
  MessageSquare,
  LayoutDashboard,
  Settings,
  BrainCircuit,
  Activity,
  RefreshCw,
  Database,
  CircleHelp,
} from 'lucide-react';
import { checkBackend, fetchMarket } from '../../services/api';

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/market', icon: LineChart, label: 'Market Data' },
  { to: '/sentiment', icon: MessageSquare, label: 'AI Sentiment' },
  { to: '/prediction', icon: Activity, label: 'Prediction' },
  { to: '/model', icon: BrainCircuit, label: 'Model Performance' },
  { to: '/backtest', icon: BarChart3, label: 'Backtest' },
];

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-surface lg:flex">
      <div className="border-b border-white/5 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">SignalForge AI</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Hybrid Stock Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/70">Workspace</p>
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/10'
                  : 'text-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive ? 'bg-white/5 text-white' : 'text-muted hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <div className="mt-2 flex items-center gap-2 px-3 py-2 text-[11px] text-muted/70">
          <CircleHelp size={14} />
          Educational demonstration
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const location = useLocation();
  const [connected, setConnected] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [range, setRange] = useState({ start: '—', end: '—' });

  const pageName = location.pathname === '/' ? 'Overview' : location.pathname.slice(1).replace('-', ' ');

  const refresh = async () => {
    setAnalyzing(true);
    window.dispatchEvent(new Event('refresh_data'));
    const ok = await checkBackend();
    setConnected(ok);
    window.setTimeout(() => setAnalyzing(false), 500);
  };

  useEffect(() => {
    let active = true;
    Promise.all([checkBackend(), fetchMarket()])
      .then(([ok, market]) => {
        if (!active) return;
        setConnected(ok || market.length > 0);
        if (market.length) {
          setRange({ start: market[0].date, end: market[market.length - 1].date });
        }
      })
      .catch(() => active && setConnected(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-background/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <BrainCircuit size={17} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden font-semibold text-white sm:inline">SignalForge</span>
            <span className="hidden text-white/20 sm:inline">/</span>
            <span className="capitalize text-muted">{pageName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-white/5 bg-surface px-3 py-2 sm:flex">
            <Database size={14} className="text-primary" />
            <span className="font-semibold text-white">NVDA</span>
            <span className="border-l border-white/10 pl-2 text-muted">NVIDIA Corporation</span>
          </div>
          <div className="hidden rounded-lg border border-white/5 bg-surface px-3 py-2 xl:block">
            <span className="text-muted">Dataset </span>
            <span className="text-white">{range.start}</span>
            <span className="mx-1 text-white/30">→</span>
            <span className="text-white">{range.end}</span>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw size={14} className={analyzing ? 'animate-spin' : ''} />
            {analyzing ? 'Refreshing' : 'Analyze'}
          </button>
          <div className="hidden items-center gap-2 rounded-lg border border-white/5 bg-surface px-3 py-2 md:flex">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-positive shadow-[0_0_8px_rgba(16,185,129,.7)]' : 'bg-negative'}`} />
            <span className="text-muted">{connected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
