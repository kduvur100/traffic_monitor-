// ─── Core enums ────────────────────────────────────────────────────────────────

export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'FTP';
export type EventStatus = 'allowed' | 'blocked' | 'flagged';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType =
  | 'port_scan'
  | 'brute_force'
  | 'ddos'
  | 'data_exfil'
  | 'unusual_protocol'
  | 'geo_anomaly'
  | 'custom';

// ─── Network event ──────────────────────────────────────────────────────────────

export interface NetworkEvent {
  id: string;
  timestamp: number;           // Unix ms
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: Protocol;
  bytesSent: number;
  bytesReceived: number;
  durationMs: number;
  status: EventStatus;
  country?: string;            // optional GeoIP (future)
  tags: string[];              // e.g. ['internal', 'encrypted']
}

// ─── Alert ─────────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  srcIp: string;
  timestamp: number;
  relatedEventIds: string[];
  acknowledged: boolean;
  metadata: Record<string, unknown>;  // extra rule-specific data
}

// ─── Aggregated stats (sent to frontend every tick) ────────────────────────────

export interface TrafficStats {
  timestamp: number;
  totalEvents: number;
  blockedEvents: number;
  flaggedEvents: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  eventsPerSecond: number;
  protocolBreakdown: Record<Protocol, number>;
  topSrcIps: Array<{ ip: string; count: number }>;
  topDstPorts: Array<{ port: number; count: number }>;
}

// ─── WebSocket message envelope ────────────────────────────────────────────────

export type WSMessageType = 'event' | 'alert' | 'stats' | 'ping';

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
}

// ─── Detection rule ────────────────────────────────────────────────────────────

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  check: (event: NetworkEvent, windowEvents: NetworkEvent[]) => Alert | null;
}

// ─── In-memory store snapshot ──────────────────────────────────────────────────

export interface StoreSnapshot {
  recentEvents: NetworkEvent[];
  activeAlerts: Alert[];
  stats: TrafficStats | null;
}
