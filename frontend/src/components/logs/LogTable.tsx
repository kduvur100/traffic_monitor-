import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { NetworkEvent } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { fmtBytes, fmtTime } from '@/utils/format';

interface LogTableProps {
  events: NetworkEvent[];
}

type SortKey = 'timestamp' | 'srcIp' | 'dstPort' | 'bytesSent' | 'protocol';

const PROTOCOL_COLORS: Record<string, string> = {
  HTTP:  'text-green-400',
  HTTPS: 'text-emerald-400',
  DNS:   'text-sky-400',
  SSH:   'text-yellow-400',
  FTP:   'text-orange-400',
  TCP:   'text-blue-400',
  UDP:   'text-purple-400',
  ICMP:  'text-pink-400',
};

export function LogTable({ events }: LogTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'blocked' | 'flagged'>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...events]
      .filter((e) => {
        if (filter !== 'all' && e.status !== filter) return false;
        if (!q) return true;
        return (
          e.srcIp.includes(q) ||
          e.dstIp.includes(q) ||
          e.protocol.toLowerCase().includes(q) ||
          String(e.dstPort).includes(q)
        );
      })
      .sort((a, b) => {
        const v = (e: NetworkEvent) => e[sortKey as keyof NetworkEvent] as number | string;
        const cmp = v(a) < v(b) ? -1 : v(a) > v(b) ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
      .slice(0, 200);
  }, [events, search, sortKey, sortDir, filter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="ml-1 opacity-50">
      {sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  );

  return (
    <Card title="Connection Log">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-40">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full bg-surface border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent-blue"
            placeholder="Filter by IP, protocol, port…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'blocked', 'flagged'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface border border-surface-border text-gray-400 hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-border text-gray-500">
              <th className="text-left pb-2 pr-3 cursor-pointer hover:text-gray-300 whitespace-nowrap" onClick={() => toggleSort('timestamp')}>
                Time <SortIcon k="timestamp" />
              </th>
              <th className="text-left pb-2 pr-3 cursor-pointer hover:text-gray-300" onClick={() => toggleSort('srcIp')}>
                Src IP <SortIcon k="srcIp" />
              </th>
              <th className="text-left pb-2 pr-3 text-gray-500">Dst IP</th>
              <th className="text-left pb-2 pr-3 cursor-pointer hover:text-gray-300" onClick={() => toggleSort('dstPort')}>
                Port <SortIcon k="dstPort" />
              </th>
              <th className="text-left pb-2 pr-3 cursor-pointer hover:text-gray-300" onClick={() => toggleSort('protocol')}>
                Proto <SortIcon k="protocol" />
              </th>
              <th className="text-left pb-2 pr-3 cursor-pointer hover:text-gray-300" onClick={() => toggleSort('bytesSent')}>
                Sent <SortIcon k="bytesSent" />
              </th>
              <th className="text-left pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-600">No events match</td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-white/5 transition-colors">
                <td className="py-1.5 pr-3 text-gray-500 font-mono whitespace-nowrap">{fmtTime(e.timestamp)}</td>
                <td className="py-1.5 pr-3 text-gray-300 font-mono">{e.srcIp}</td>
                <td className="py-1.5 pr-3 text-gray-400 font-mono">{e.dstIp}</td>
                <td className="py-1.5 pr-3 text-gray-400">{e.dstPort}</td>
                <td className="py-1.5 pr-3">
                  <span className={`font-medium ${PROTOCOL_COLORS[e.protocol] ?? 'text-gray-400'}`}>
                    {e.protocol}
                  </span>
                </td>
                <td className="py-1.5 pr-3 text-gray-500">{fmtBytes(e.bytesSent)}</td>
                <td className="py-1.5">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-600 mt-2 text-right">
          Showing {filtered.length} of {events.length} events
        </p>
      </div>
    </Card>
  );
}
