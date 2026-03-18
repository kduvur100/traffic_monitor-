import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/Card';
import { TrafficStats } from '@/types';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#06b6d4', '#f97316', '#ec4899'];

interface ProtocolChartProps {
  stats: TrafficStats | null;
}

export function ProtocolChart({ stats }: ProtocolChartProps) {
  const data = stats
    ? Object.entries(stats.protocolBreakdown)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
    : [];

  return (
    <Card title="Protocol Breakdown">
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
          Waiting for data…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 12 }}
              formatter={(val: number) => [val.toLocaleString(), 'Events']}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
