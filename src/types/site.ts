export type SiteStatus = 'operational' | 'opening-2026' | 'maintenance' | 'offline';

export interface Site {
  id: string;
  name: string;
  city: string;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  totalUnits: number;
  occupiedUnits: number;
  occupancyPercent: number;
  totalAreaSqm: number;
  floors: number;
  yearBuilt: number;
  epcRating: string;
  hasSmartMeters: boolean;
  hasSolar: boolean;
  hasBattery: boolean;
  hasHeatPump: boolean;
  imageUrl?: string;
}

export interface SiteMetrics {
  siteId: string;
  period: string;
  consumptionKwh: number;
  costGbp: number;
  co2Kg: number;
  kwhPerUnit: number;
  costPerUnit: number;
  savingsGbp: number;
  savingsPercent: number;
  agentActionsCount: number;
  alertsCount: number;
}

export interface RoomType {
  id: string;
  name: string;
  avgConsumptionKwh: number;
  count: number;
  iconName: string;
}
