export type AlertLevel = 'info' | 'warning' | 'critical';
export type AlertCategory =
  | 'consumption'
  | 'demand'
  | 'cost'
  | 'equipment'
  | 'weather'
  | 'compliance'
  | 'agent';

export interface Alert {
  id: string;
  siteId: string;
  siteName: string;
  timestamp: Date;
  level: AlertLevel;
  category: AlertCategory;
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  unacknowledged: number;
}
