import { v4 as uuid } from 'uuid';
import { NetworkEvent, Protocol } from '../types/index.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

const PROTOCOLS: Protocol[] = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'FTP'];
const INTERNAL_NETS = ['10.0.0', '192.168.1', '172.16.0'];
const EXTERNAL_IPS = [
  '203.0.113', '198.51.100', '185.220.101', '91.108.4', '104.21.0',
  '45.33.32', '66.220.144', '89.248.167', '134.119.189', '159.65.1',
];

const randomIp = (net: string) => `${net}.${rand(1, 254)}`;
const randomInternalIp = () => randomIp(pick(INTERNAL_NETS));
const randomExternalIp = () => randomIp(pick(EXTERNAL_IPS));

const COMMON_PORTS = [80, 443, 53, 22, 21, 3389, 8080, 8443, 3306, 5432, 6379, 27017];

// ─── Normal traffic ────────────────────────────────────────────────────────────

export function generateNormalEvent(): NetworkEvent {
  const protocol = pick(PROTOCOLS);
  const isOutbound = Math.random() > 0.4;

  return {
    id: uuid(),
    timestamp: Date.now(),
    srcIp: isOutbound ? randomInternalIp() : randomExternalIp(),
    dstIp: isOutbound ? randomExternalIp() : randomInternalIp(),
    srcPort: rand(1024, 65535),
    dstPort: pick(COMMON_PORTS),
    protocol,
    bytesSent: rand(64, 65_536),
    bytesReceived: rand(64, 131_072),
    durationMs: rand(10, 5_000),
    status: Math.random() > 0.05 ? 'allowed' : 'blocked',
    tags: isOutbound ? ['outbound'] : ['inbound'],
  };
}

// ─── Attack scenarios ──────────────────────────────────────────────────────────

/** Port scan: one src IP hitting many ports quickly */
export function generatePortScanBurst(count = 20): NetworkEvent[] {
  const srcIp = randomExternalIp();
  return Array.from({ length: count }, (_, i) => ({
    id: uuid(),
    timestamp: Date.now() + i * 50,
    srcIp,
    dstIp: randomInternalIp(),
    srcPort: rand(1024, 65535),
    dstPort: rand(1, 1024),
    protocol: 'TCP' as Protocol,
    bytesSent: 64,
    bytesReceived: 0,
    durationMs: rand(1, 50),
    status: 'blocked' as const,
    tags: ['inbound', 'scan'],
  }));
}

/** Brute force: repeated SSH/FTP connections from same IP */
export function generateBruteForceBurst(count = 15): NetworkEvent[] {
  const srcIp = randomExternalIp();
  const protocol = pick(['SSH', 'FTP'] as Protocol[]);
  const dstPort = protocol === 'SSH' ? 22 : 21;

  return Array.from({ length: count }, (_, i) => ({
    id: uuid(),
    timestamp: Date.now() + i * 200,
    srcIp,
    dstIp: randomInternalIp(),
    srcPort: rand(1024, 65535),
    dstPort,
    protocol,
    bytesSent: rand(128, 512),
    bytesReceived: rand(64, 256),
    durationMs: rand(100, 800),
    status: 'flagged' as const,
    tags: ['inbound', 'auth'],
  }));
}

/** DDoS simulation: many different IPs flooding one destination */
export function generateDDoSBurst(count = 40): NetworkEvent[] {
  const dstIp = randomInternalIp();
  return Array.from({ length: count }, (_, i) => ({
    id: uuid(),
    timestamp: Date.now() + i * 10,
    srcIp: randomExternalIp(),
    dstIp,
    srcPort: rand(1024, 65535),
    dstPort: pick([80, 443]),
    protocol: pick(['TCP', 'UDP'] as Protocol[]),
    bytesSent: rand(512, 4096),
    bytesReceived: 0,
    durationMs: rand(1, 100),
    status: 'blocked' as const,
    tags: ['inbound', 'flood'],
  }));
}

/** Data exfiltration: large outbound transfers */
export function generateDataExfilBurst(count = 5): NetworkEvent[] {
  const srcIp = randomInternalIp();
  return Array.from({ length: count }, (_, i) => ({
    id: uuid(),
    timestamp: Date.now() + i * 1000,
    srcIp,
    dstIp: randomExternalIp(),
    srcPort: rand(1024, 65535),
    dstPort: pick([443, 8443, 21]),
    protocol: pick(['HTTPS', 'FTP'] as Protocol[]),
    bytesSent: rand(5_000_000, 50_000_000),   // 5-50 MB
    bytesReceived: rand(64, 512),
    durationMs: rand(5_000, 30_000),
    status: 'flagged' as const,
    tags: ['outbound', 'large-transfer'],
  }));
}
