import { useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEventStore } from '@/hooks/useEventStore';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/pages/Dashboard';
import { WSMessage, NetworkEvent, Alert, TrafficStats } from '@/types';

const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

export default function App() {
  const {
    events, alerts, stats,
    pushEvent, pushAlert, updateStats,
    acknowledgeAlert, dismissAlert, clearAllAlerts,
  } = useEventStore();

  const handleMessage = useCallback((msg: WSMessage) => {
    if (msg.type === 'event')  pushEvent(msg.payload as NetworkEvent);
    if (msg.type === 'alert')  pushAlert(msg.payload as Alert);
    if (msg.type === 'stats')  updateStats(msg.payload as TrafficStats);
  }, [pushEvent, pushAlert, updateStats]);

  const { status } = useWebSocket({ url: WS_URL, onMessage: handleMessage });

  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-surface">
      <Header status={status} alertCount={unacknowledged} eventsPerSecond={stats?.eventsPerSecond} />
      <Dashboard
        events={events}
        alerts={alerts}
        stats={stats}
        onAcknowledge={acknowledgeAlert}
        onDismiss={dismissAlert}
        onClearAll={clearAllAlerts}
      />
    </div>
  );
}
