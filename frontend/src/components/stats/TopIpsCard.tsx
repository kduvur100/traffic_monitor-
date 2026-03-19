import { Card } from '@/components/ui/Card';
import { TrafficStats } from '@/types';

interface TopIpsCardProps {
  stats: TrafficStats | null;
}

export function TopIpsCard({ stats }: TopIpsCardProps) {
  const items = stats?.topSrcIps ?? [];
  const max = items[0]?.count ?? 1;

  return (
    <Card title="Top Source IPs">
      {items.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-4">Waiting for data…</p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ ip, count }) => (
            <li key={ip}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-mono text-gray-300">{ip}</span>
                <span className="text-xs text-gray-500 tabular-nums">{count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-blue rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
