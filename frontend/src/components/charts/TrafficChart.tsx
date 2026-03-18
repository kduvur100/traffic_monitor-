import { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { NetworkEvent } from '@/types';

interface Bucket {
  label: string;
  total: number;
  blocked: number;
  flagged: number;
}

const BUCKETS = 30; // 30 seconds of history

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

interface TrafficChartProps {
  events: NetworkEvent[];
}

export function TrafficChart({ events }: TrafficChartProps) {
  const [buckets, setBuckets] = useState<Bucket[]>(() =>
    Array.from({ length: BUCKETS }, (_, i) => ({
      label: formatTime(Date.now() - (BUCKETS - 1 - i) * 1000),
      total: 0,
      blocked: 0,
      flagged: 0,
    }))
  );

  const lastFlush = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastFlush.current < 1000) return;
    lastFlush.current = now;

    const window = events.filter((e) => now - e.timestamp < 1000);
    const total = window.length;
    const blocked = window.filter((e) => e.status === 'blocked').length;
    const flagged = window.filter((e) => e.status === 'flagged').length;

    setBuckets((prev) => {
      const next = [...prev.slice(1), { label: formatTime(now), total, blocked, flagged }];
      return next;
    });
  }, [events]);

  return (
    <Card title="Traffic Over Time">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={buckets} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gBlocked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gFlagged" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} interval={4} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          <Area type="monotone" dataKey="total"   name="Total"   stroke="#3b82f6" fill="url(#gTotal)"   strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="blocked" name="Blocked" stroke="#ef4444" fill="url(#gBlocked)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="flagged" name="Flagged" stroke="#eab308" fill="url(#gFlagged)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
