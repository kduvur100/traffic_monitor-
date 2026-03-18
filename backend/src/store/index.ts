import { config } from '../config/index.js';
import { Alert, NetworkEvent, Protocol, TrafficStats } from '../types/index.js';

/**
 * In-memory store.  All state lives here so routes + websocket handlers
 * can share a single source of truth.  Swap internals for Redis/Postgres later.
 */
class Store {
  private events: NetworkEvent[] = [];
  private alerts: Alert[] = [];
  private _stats: TrafficStats | null = null;

  // ── Events ────────────────────────────────────────────────────────────────

  addEvents(incoming: NetworkEvent[]) {
    this.events.push(...incoming);
    if (this.events.length > config.maxStoredEvents) {
      this.events = this.events.slice(-config.maxStoredEvents);
    }
  }

  getRecentEvents(limit = 200): NetworkEvent[] {
    return this.events.slice(-limit);
  }

  getEventsInWindow(windowMs: number): NetworkEvent[] {
    const cutoff = Date.now() - windowMs;
    return this.events.filter((e) => e.timestamp >= cutoff);
  }

  // ── Alerts ────────────────────────────────────────────────────────────────

  addAlert(alert: Alert) {
    this.alerts.push(alert);
    if (this.alerts.length > config.maxStoredAlerts) {
      this.alerts = this.alerts.slice(-config.maxStoredAlerts);
    }
  }

  getAlerts(limit = 100): Alert[] {
    return this.alerts.slice(-limit);
  }

  acknowledgeAlert(id: string): boolean {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) return false;
    alert.acknowledged = true;
    return true;
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  computeStats(): TrafficStats {
    const windowMs = config.detectionWindowMs;
    const windowEvents = this.getEventsInWindow(windowMs);

    const blocked = windowEvents.filter((e) => e.status === 'blocked').length;
    const flagged = windowEvents.filter((e) => e.status === 'flagged').length;
    const bytesSent = windowEvents.reduce((s, e) => s + e.bytesSent, 0);
    const bytesRecv = windowEvents.reduce((s, e) => s + e.bytesReceived, 0);

    const protocolBreakdown = {} as Record<Protocol, number>;
    for (const e of windowEvents) {
      protocolBreakdown[e.protocol] = (protocolBreakdown[e.protocol] || 0) + 1;
    }

    // top 5 source IPs
    const srcCounts: Record<string, number> = {};
    for (const e of windowEvents) srcCounts[e.srcIp] = (srcCounts[e.srcIp] || 0) + 1;
    const topSrcIps = Object.entries(srcCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }));

    // top 5 destination ports
    const portCounts: Record<number, number> = {};
    for (const e of windowEvents) portCounts[e.dstPort] = (portCounts[e.dstPort] || 0) + 1;
    const topDstPorts = Object.entries(portCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([port, count]) => ({ port: Number(port), count }));

    const eventsPerSecond = windowMs > 0
      ? +(windowEvents.length / (windowMs / 1000)).toFixed(2)
      : 0;

    this._stats = {
      timestamp: Date.now(),
      totalEvents: this.events.length,
      blockedEvents: blocked,
      flaggedEvents: flagged,
      totalBytesSent: bytesSent,
      totalBytesReceived: bytesRecv,
      eventsPerSecond,
      protocolBreakdown,
      topSrcIps,
      topDstPorts,
    };

    return this._stats;
  }

  get stats() { return this._stats; }
}

// Singleton export
export const store = new Store();
