import { Shield, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  alertCount: number;
}

const statusConfig = {
  connecting:   { label: 'Connecting…', dot: 'bg-yellow-400 animate-pulse' },
  connected:    { label: 'Live',        dot: 'bg-green-400' },
  disconnected: { label: 'Disconnected', dot: 'bg-red-400' },
  error:        { label: 'Error',        dot: 'bg-red-600 animate-pulse' },
};

export function Header({ status, alertCount }: HeaderProps) {
  const { label, dot } = statusConfig[status];
  const isLive = status === 'connected';

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface/90 backdrop-blur">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-accent-blue" />
          <span className="text-lg font-semibold tracking-tight">
            Traffic<span className="text-accent-blue">Monitor</span>
          </span>
        </div>

        {/* Status + alerts */}
        <div className="flex items-center gap-4">
          {alertCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
              {alertCount} active alert{alertCount !== 1 ? 's' : ''}
            </span>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            {isLive
              ? <Wifi className="w-4 h-4 text-green-400" />
              : <WifiOff className="w-4 h-4 text-red-400" />}
            <span className={dot.includes('green') ? 'text-green-400' : 'text-red-400'}>
              {label}
            </span>
            <span className={`w-2 h-2 rounded-full ${dot}`} />
          </div>
        </div>
      </div>
    </header>
  );
}
