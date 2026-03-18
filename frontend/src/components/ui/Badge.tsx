import { AlertSeverity, EventStatus } from '@/types';

// ─── Severity badge ────────────────────────────────────────────────────────────

const severityClasses: Record<AlertSeverity, string> = {
  low:      'bg-blue-900/50 text-blue-300 border border-blue-700',
  medium:   'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  high:     'bg-orange-900/50 text-orange-300 border border-orange-700',
  critical: 'bg-red-900/50 text-red-300 border border-red-700 animate-pulse',
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${severityClasses[severity]}`}>
      {severity}
    </span>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const statusClasses: Record<EventStatus, string> = {
  allowed: 'bg-green-900/40 text-green-400',
  blocked: 'bg-red-900/40 text-red-400',
  flagged: 'bg-yellow-900/40 text-yellow-400',
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

// ─── Generic tag ──────────────────────────────────────────────────────────────

export function Tag({ label }: { label: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded bg-surface-border text-gray-400 text-xs">
      {label}
    </span>
  );
}
