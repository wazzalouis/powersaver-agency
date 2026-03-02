'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/formatters';
import type { Alert } from '@/types/alert';

interface AlertRowProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
}

const levelIcons = {
  critical: <AlertTriangle size={16} className="text-fusion-danger" />,
  warning:  <AlertCircle size={16} className="text-fusion-warning" />,
  info:     <Info size={16} className="text-fusion-info" />,
};

const levelVariants = {
  critical: 'danger' as const,
  warning:  'warning' as const,
  info:     'info' as const,
};

export function AlertRow({ alert, onAcknowledge }: AlertRowProps) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-[var(--fusion-radius)] border transition-colors ${
      alert.acknowledged ? 'border-fusion-cream bg-white' : 'border-fusion-warning/20 bg-fusion-warning/5'
    }`}>
      {levelIcons[alert.level]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-fusion-text truncate">{alert.title}</p>
          <Badge variant={levelVariants[alert.level]}>{alert.level}</Badge>
        </div>
        <p className="text-xs text-fusion-text-secondary mt-0.5">{alert.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-fusion-text-muted">{alert.siteName}</span>
          <span className="text-xs text-fusion-text-muted">{formatRelative(alert.timestamp)}</span>
        </div>
      </div>
      {!alert.acknowledged && onAcknowledge && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="text-xs text-fusion-primary hover:underline whitespace-nowrap"
        >
          Acknowledge
        </button>
      )}
    </div>
  );
}
