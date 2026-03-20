import { Card } from '@/components/ui/Card';
import { TrafficStats } from '@/types';

// Well-known port labels for quick readability
const PORT_LABELS: Record<number, string> = {
  80:    'HTTP',
  443:   'HTTPS',
  22:    'SSH',
  21:    'FTP',
  53:    'DNS',
  3389:  'RDP',
  3306:  'MySQL',
  5432:  'Postgres',
  6379:  'Redis',
  27017: 'Mongo',
  8080:  'HTTP-alt',
  8443:  'HTTPS-alt',
};

interface TopPortsCardProps {
  stats: TrafficStats | null;
}

export function TopPortsCard({ stats }: TopPortsCardProps) {
  const items = stats?.topDstPorts ?? [];
  const max = items[0]?.count ?? 1;

  return (
    <Card title="Top Dest. Ports">
      {items.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-4">Waiting for data…</p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ port, count }) => (
            <li key={port}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-300 w-10 shrink-0">{port}</span>
                  {PORT_LABELS[port] && (
                    <span className="text-xs text-gray-500">{PORT_LABELS[port]}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 tabular-nums">{count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
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
