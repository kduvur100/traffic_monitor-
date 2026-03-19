import { Alert, NetworkEvent, TrafficStats } from '@/types';
import { StatsBar } from '@/components/stats/StatsBar';
import { TopIpsCard } from '@/components/stats/TopIpsCard';
import { TrafficChart } from '@/components/charts/TrafficChart';
import { ProtocolChart } from '@/components/charts/ProtocolChart';
import { AlertPanel } from '@/components/alerts/AlertPanel';
import { LogTable } from '@/components/logs/LogTable';

interface DashboardProps {
  events: NetworkEvent[];
  alerts: Alert[];
  stats: TrafficStats | null;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function Dashboard({ events, alerts, stats, onAcknowledge, onDismiss }: DashboardProps) {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-5">
      {/* Row 1 — stat cards */}
      <StatsBar stats={stats} />

      {/* Row 2 — charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2">
          <TrafficChart events={events} />
        </div>
        <div>
          <ProtocolChart stats={stats} />
        </div>
        <div>
          <TopIpsCard stats={stats} />
        </div>
      </div>

      {/* Row 3 — alerts + log */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-2">
          <AlertPanel
            alerts={alerts}
            onAcknowledge={onAcknowledge}
            onDismiss={onDismiss}
          />
        </div>
        <div className="xl:col-span-3">
          <LogTable events={events} />
        </div>
      </div>
    </main>
  );
}
