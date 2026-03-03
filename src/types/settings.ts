export interface PlatformSettings {
  agentActive: boolean;
  globalAutonomy: number;
}

export interface NotificationPreferences {
  alertLevel: 'CRITICAL' | 'CRITICAL_WARNING' | 'ALL';
  recipientEmails: string[];
  dailyDigest: boolean;
  dailyDigestTime: string;
  weeklyReport: boolean;
  weeklyReportDay: string;
}

export interface SiteAgentConfig {
  siteId: string;
  siteName: string;
  siteSlug: string;
  hvacAutoSchedule: boolean;
  voidRoomDetection: boolean;
  peakAvoidance: boolean;
  lightingAutomation: boolean;
  boilerOptimisation: boolean;
  waterHeatingOpt: boolean;
  maxAutonomyLevel: number;
  hvacMinTemp: number;
  hvacMaxTemp: number;
  nightModeStart: string;
  nightModeEnd: string;
  peakTariffThreshold: number;
}

export interface SettingsData {
  platform: PlatformSettings;
  notifications: NotificationPreferences;
  sites: SiteAgentConfig[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  previousValue: string;
  newValue: string;
  createdAt: string;
}

export interface AuditData {
  entries: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
