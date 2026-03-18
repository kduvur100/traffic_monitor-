import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function Card({ title, className = '', children, headerRight }: CardProps) {
  return (
    <div className={`bg-surface-card border border-surface-border rounded-xl p-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h2>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

// Compact stat card
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'default';
  icon?: ReactNode;
}

const colorMap = {
  green:   'text-green-400',
  red:     'text-red-400',
  yellow:  'text-yellow-400',
  blue:    'text-blue-400',
  purple:  'text-purple-400',
  default: 'text-white',
};

export function StatCard({ label, value, sub, color = 'default', icon }: StatCardProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex items-start gap-3">
      {icon && <div className="mt-0.5 text-gray-500">{icon}</div>}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${colorMap[color]}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
