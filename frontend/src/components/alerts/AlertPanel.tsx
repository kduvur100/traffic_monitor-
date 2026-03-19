import { X, CheckCircle } from 'lucide-react';
import { Alert } from '@/types';
import { SeverityBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { timeAgo } from '@/utils/format';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

const typeLabels: Record<Alert['type'], string> = {
  port_scan:        '🔍 Port Scan',
  brute_force:      '🔐 Brute Force',
  ddos:             '💥 DDoS',
  data_exfil:       '📤 Data Exfil',
  unusual_protocol: '⚠️ Protocol',
  geo_anomaly:      '🌍 Geo Anomaly',
  custom:           '🔧 Custom',
};

export function AlertPanel({ alerts, onAcknowledge, onDismiss }: AlertPanelProps) {
  const active = alerts.filter((a) => !a.acknowledged);

  return (
    <Card
      title="Active Alerts"
      headerRight={
        <span className="text-xs text-gray-500">{active.length} unacknowledged</span>
      }
    >
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {alerts.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-6">No alerts — system nominal</p>
        )}

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-3 border transition-opacity ${
              alert.acknowledged
                ? 'border-surface-border opacity-50'
                : alert.severity === 'critical'
                ? 'border-red-700 bg-red-950/30'
                : alert.severity === 'high'
                ? 'border-orange-700 bg-orange-950/20'
                : 'border-surface-border bg-surface'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs text-gray-400">{typeLabels[alert.type]}</span>
                  <span className="text-xs text-gray-600 ml-auto">{timeAgo(alert.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-200 leading-snug">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">{alert.srcIp}</p>
              </div>

              <div className="flex gap-1 shrink-0">
                {!alert.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="p-1 rounded hover:bg-green-900/40 text-gray-500 hover:text-green-400 transition-colors"
                    title="Acknowledge"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1 rounded hover:bg-red-900/40 text-gray-500 hover:text-red-400 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
