// Mirror of backend types — keep in sync or extract to a shared package later

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

export interface NetworkEvent {
  id: string;
  timestamp: number;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: Protocol;
  bytesSent: number;
  bytesReceived: number;
  durationMs: number;
  status: EventStatus;
  country?: string;
  tags: string[];
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  srcIp: string;
  timestamp: number;
  relatedEventIds: string[];
  acknowledged: boolean;
  metadata: Record<string, unknown>;
}

export interface TrafficStats {
  timestamp: number;
  totalEvents: number;
  blockedEvents: number;
  flaggedEvents: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  eventsPerSecond: number;
  protocolBreakdown: Partial<Record<Protocol, number>>;
  topSrcIps: Array<{ ip: string; count: number }>;
  topDstPorts: Array<{ port: number; count: number }>;
}

export type WSMessageType = 'event' | 'alert' | 'stats' | 'ping';

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
}
