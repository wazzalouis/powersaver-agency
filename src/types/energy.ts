export interface EnergyReading {
  id: string;
  siteId: string;
  timestamp: Date;
  consumptionKwh: number;
  generationKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  solarKwh: number;
  batteryChargeKwh: number;
  batteryDischargeKwh: number;
  demandKw: number;
  powerFactor: number;
  voltage: number;
  frequency: number;
  co2Kg: number;
  costGbp: number;
}

export interface EnergyBreakdown {
  category: string;
  kwh: number;
  percentage: number;
  color: string;
}

export interface EnergySummary {
  totalConsumptionKwh: number;
  totalCostGbp: number;
  totalCo2Kg: number;
  avgDemandKw: number;
  peakDemandKw: number;
  solarGenerationKwh: number;
  selfConsumptionPercent: number;
  gridDependencyPercent: number;
  epcRating: string;
  budgetUtilisationPercent: number;
}

export interface TariffRate {
  name: string;
  ratePerKwh: number;
  startHour: number;
  endHour: number;
  type: 'peak' | 'off-peak' | 'standard';
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';
export type Granularity = '15min' | '1h' | '1d' | '1w' | '1m';
