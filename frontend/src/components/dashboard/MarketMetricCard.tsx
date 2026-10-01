import { Card, CardContent } from '../common/Card';
import { Skeleton } from '../common/Skeleton';

export function MarketMetricCard({ label, value, subValue, loading }: { label: string; value: string | number; subValue?: string; loading?: boolean }) {
  if (loading) return <Card><CardContent className="p-5"><Skeleton className="h-4 w-24"/><Skeleton className="mt-3 h-8 w-32"/><Skeleton className="mt-2 h-3 w-28"/></CardContent></Card>;
  return <Card className="transition hover:border-white/10"><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p>{subValue&&<p className="mt-1 text-xs text-muted">{subValue}</p>}</CardContent></Card>;
}
