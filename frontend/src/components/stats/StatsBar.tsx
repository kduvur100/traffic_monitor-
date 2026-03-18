import { Activity, Ban, Flag, HardDrive, Zap } from 'lucide-react';
import { StatCard } from '@/components/ui/Card';
import { TrafficStats } from '@/types';

function fmtBytes(b: number): string {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)} GB`;
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b >= 1_000) return `${(b / 1_000).toFixed(1)} KB`;
  return `${b} B`;
}

interface StatsBarProps {
  stats: TrafficStats | null;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        label="Total Events"
        value={stats?.totalEvents.toLocaleString() ?? '—'}
        color="blue"
        icon={<Activity className="w-5 h-5" />}
      />
      <StatCard
        label="Blocked"
        value={stats?.blockedEvents.toLocaleString() ?? '—'}
        color="red"
        icon={<Ban className="w-5 h-5" />}
      />
      <StatCard
        label="Flagged"
        value={stats?.flaggedEvents.toLocaleString() ?? '—'}
        color="yellow"
        icon={<Flag className="w-5 h-5" />}
      />
      <StatCard
        label="Data Transferred"
        value={stats ? fmtBytes(stats.totalBytesSent + stats.totalBytesReceived) : '—'}
        color="purple"
        icon={<HardDrive className="w-5 h-5" />}
      />
      <StatCard
        label="Events / sec"
        value={stats?.eventsPerSecond ?? '—'}
        color="green"
        icon={<Zap className="w-5 h-5" />}
      />
    </div>
  );
}
