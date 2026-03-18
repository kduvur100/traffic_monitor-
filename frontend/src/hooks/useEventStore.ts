import { useCallback, useState } from 'react';
import { Alert, NetworkEvent, TrafficStats } from '@/types';

const MAX_EVENTS = 500;
const MAX_ALERTS = 100;

/**
 * Client-side ring buffer that merges events/alerts/stats
 * coming from the WebSocket.
 */
export function useEventStore() {
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<TrafficStats | null>(null);

  const pushEvent = useCallback((event: NetworkEvent) => {
    setEvents((prev) => {
      const next = [...prev, event];
      return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
    });
  }, []);

  const pushAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => {
      const next = [alert, ...prev];
      return next.length > MAX_ALERTS ? next.slice(0, MAX_ALERTS) : next;
    });
  }, []);

  const updateStats = useCallback((s: TrafficStats) => {
    setStats(s);
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    fetch(`/api/alerts/${id}/acknowledge`, { method: 'PATCH' }).catch(console.error);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    events,
    alerts,
    stats,
    pushEvent,
    pushAlert,
    updateStats,
    acknowledgeAlert,
    dismissAlert,
  };
}
