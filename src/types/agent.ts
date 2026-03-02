export type AgentStatus = 'active' | 'paused' | 'learning' | 'error';
export type ActionType =
  | 'hvac-adjustment'
  | 'lighting-schedule'
  | 'load-shift'
  | 'demand-response'
  | 'battery-dispatch'
  | 'tariff-optimisation'
  | 'anomaly-detected'
  | 'maintenance-flag';

export type ActionSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AgentAction {
  id: string;
  siteId: string;
  timestamp: Date;
  type: ActionType;
  severity: ActionSeverity;
  description: string;
  savingsGbp: number;
  savingsKwh: number;
  confidence: number;
  automated: boolean;
  status: 'proposed' | 'approved' | 'executed' | 'rejected' | 'reverted';
}

export interface AgentSummary {
  status: AgentStatus;
  totalActions: number;
  totalSavingsGbp: number;
  totalSavingsKwh: number;
  automationRate: number;
  avgConfidence: number;
  activeSites: number;
  lastAction?: AgentAction;
}

export interface AgentRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: ActionType;
  priority: number;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
}
