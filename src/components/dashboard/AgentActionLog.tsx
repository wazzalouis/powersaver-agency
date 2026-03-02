'use client';

import { Brain, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatRelative, formatCurrency } from '@/lib/formatters';
import type { AgentAction } from '@/types/agent';

interface AgentActionLogProps {
  actions: AgentAction[];
}

const statusIcons = {
  executed: <CheckCircle size={14} className="text-fusion-success" />,
  proposed: <Clock size={14} className="text-fusion-warning" />,
  approved: <CheckCircle size={14} className="text-fusion-info" />,
  rejected: <XCircle size={14} className="text-fusion-danger" />,
  reverted: <XCircle size={14} className="text-fusion-text-muted" />,
};

export function AgentActionLog({ actions }: AgentActionLogProps) {
  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <div key={action.id} className="flex items-start gap-3 p-3 rounded-[var(--fusion-radius)] bg-white border border-fusion-cream/50">
          <div className="p-1.5 rounded-[var(--fusion-radius)] bg-fusion-primary/10">
            <Brain size={14} className="text-fusion-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-fusion-text truncate">{action.description}</p>
              {statusIcons[action.status]}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={action.automated ? 'success' : 'info'}>
                {action.automated ? 'Auto' : 'Manual'}
              </Badge>
              {action.savingsGbp > 0 && (
                <span className="text-xs text-fusion-success font-medium">{formatCurrency(action.savingsGbp)} saved</span>
              )}
              <span className="text-xs text-fusion-text-muted">{formatRelative(action.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
