import { v4 as uuid } from 'uuid';
import { Alert, DetectionRule, NetworkEvent } from '../types/index.js';

// ─── Helper ───────────────────────────────────────────────────────────────────

const makeAlert = (
  partial: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>
): Alert => ({
  id: uuid(),
  timestamp: Date.now(),
  acknowledged: false,
  ...partial,
});

// ─── Rules ────────────────────────────────────────────────────────────────────

export const rules: DetectionRule[] = [
  {
    id: 'port-scan',
    name: 'Port Scan Detection',
    description: 'Fires when one source IP contacts 10+ distinct ports in the window.',
    enabled: true,
    check(event, windowEvents) {
      const fromSrc = windowEvents.filter((e) => e.srcIp === event.srcIp);
      const uniquePorts = new Set(fromSrc.map((e) => e.dstPort));
      if (uniquePorts.size >= 10) {
        return makeAlert({
          type: 'port_scan',
          severity: 'high',
          message: `Port scan detected from ${event.srcIp} — ${uniquePorts.size} unique ports probed`,
          srcIp: event.srcIp,
          relatedEventIds: fromSrc.map((e) => e.id),
          metadata: { uniquePorts: uniquePorts.size },
        });
      }
      return null;
    },
  },

  {
    id: 'brute-force',
    name: 'Brute Force Detection',
    description: 'Fires when the same IP makes 8+ connections to port 22 or 21.',
    enabled: true,
    check(event, windowEvents) {
      if (![22, 21].includes(event.dstPort)) return null;
      const attempts = windowEvents.filter(
        (e) => e.srcIp === event.srcIp && e.dstPort === event.dstPort
      );
      if (attempts.length >= 8) {
        const proto = event.dstPort === 22 ? 'SSH' : 'FTP';
        return makeAlert({
          type: 'brute_force',
          severity: 'critical',
          message: `Brute force on ${proto} from ${event.srcIp} — ${attempts.length} attempts`,
          srcIp: event.srcIp,
          relatedEventIds: attempts.map((e) => e.id),
          metadata: { protocol: proto, attempts: attempts.length },
        });
      }
      return null;
    },
  },

  {
    id: 'ddos',
    name: 'DDoS / Flood Detection',
    description: 'Fires when a single destination receives traffic from 20+ unique IPs.',
    enabled: true,
    check(event, windowEvents) {
      const toDst = windowEvents.filter((e) => e.dstIp === event.dstIp);
      const uniqueSrcs = new Set(toDst.map((e) => e.srcIp));
      if (uniqueSrcs.size >= 20) {
        return makeAlert({
          type: 'ddos',
          severity: 'critical',
          message: `Possible DDoS on ${event.dstIp} — ${uniqueSrcs.size} unique source IPs`,
          srcIp: event.srcIp,
          relatedEventIds: toDst.slice(0, 50).map((e) => e.id),
          metadata: { targetIp: event.dstIp, uniqueSources: uniqueSrcs.size },
        });
      }
      return null;
    },
  },

  {
    id: 'data-exfil',
    name: 'Data Exfiltration Detection',
    description: 'Fires when outbound bytes from one internal IP exceed 20 MB in the window.',
    enabled: true,
    check(event, windowEvents) {
      if (!event.srcIp.startsWith('10.') &&
          !event.srcIp.startsWith('192.168.') &&
          !event.srcIp.startsWith('172.16.')) return null;

      const fromSrc = windowEvents.filter((e) => e.srcIp === event.srcIp);
      const totalBytes = fromSrc.reduce((sum, e) => sum + e.bytesSent, 0);
      const threshold = 20_000_000; // 20 MB
      if (totalBytes >= threshold) {
        return makeAlert({
          type: 'data_exfil',
          severity: 'high',
          message: `High outbound data from ${event.srcIp} — ${(totalBytes / 1_000_000).toFixed(1)} MB`,
          srcIp: event.srcIp,
          relatedEventIds: fromSrc.map((e) => e.id),
          metadata: { totalBytesMB: +(totalBytes / 1_000_000).toFixed(2) },
        });
      }
      return null;
    },
  },

  {
    id: 'unusual-protocol',
    name: 'Unusual Protocol on Standard Port',
    description: 'Flags non-HTTP traffic on port 80 or non-HTTPS on port 443.',
    enabled: true,
    check(event) {
      const mismatch =
        (event.dstPort === 80 && event.protocol !== 'HTTP' && event.protocol !== 'TCP') ||
        (event.dstPort === 443 && event.protocol !== 'HTTPS' && event.protocol !== 'TCP');
      if (mismatch) {
        return makeAlert({
          type: 'unusual_protocol',
          severity: 'medium',
          message: `Unexpected protocol ${event.protocol} on port ${event.dstPort} from ${event.srcIp}`,
          srcIp: event.srcIp,
          relatedEventIds: [event.id],
          metadata: { protocol: event.protocol, port: event.dstPort },
        });
      }
      return null;
    },
  },
];
