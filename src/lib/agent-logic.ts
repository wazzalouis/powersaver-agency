/**
 * AI Agent Decision Logic
 * Simulates autonomous energy management decisions.
 */

import type { AgentAction, AgentSummary, ActionType } from '@/types/agent';
import type { EnergyReading } from '@/types/energy';

const ACTION_TEMPLATES: Record<ActionType, { descriptions: string[]; avgSavingsGbp: number; avgSavingsKwh: number }> = {
  'hvac-adjustment': {
    descriptions: [
      'Reduced HVAC setpoint by 1°C during unoccupied hours',
      'Shifted pre-heating schedule 30 min later based on occupancy prediction',
      'Enabled night setback mode for communal areas',
    ],
    avgSavingsGbp: 45,
    avgSavingsKwh: 180,
  },
  'lighting-schedule': {
    descriptions: [
      'Dimmed corridor lighting to 40% between 01:00–06:00',
      'Adjusted exterior lighting schedule to match sunset times',
      'Disabled decorative lighting in unoccupied common rooms',
    ],
    avgSavingsGbp: 12,
    avgSavingsKwh: 45,
  },
  'load-shift': {
    descriptions: [
      'Shifted laundry equipment pre-heat to off-peak tariff window',
      'Deferred hot water boost cycle to 02:00–05:00 off-peak',
      'Moved EV charger scheduling to overnight off-peak rates',
    ],
    avgSavingsGbp: 28,
    avgSavingsKwh: 0,
  },
  'demand-response': {
    descriptions: [
      'Participated in National Grid demand flex event',
      'Reduced peak demand by 15% during Triad warning period',
      'Activated demand limitation protocol during grid stress',
    ],
    avgSavingsGbp: 85,
    avgSavingsKwh: 120,
  },
  'battery-dispatch': {
    descriptions: [
      'Discharged battery during peak tariff (16:00–19:00)',
      'Charged battery from solar surplus for evening dispatch',
      'Optimised battery SoC for tomorrow\'s forecast demand',
    ],
    avgSavingsGbp: 35,
    avgSavingsKwh: 95,
  },
  'tariff-optimisation': {
    descriptions: [
      'Identified 12% potential saving by switching to Agile tariff',
      'Recommended half-hourly settlement for improved cost tracking',
      'Flagged reactive power charges — power factor correction advised',
    ],
    avgSavingsGbp: 150,
    avgSavingsKwh: 0,
  },
  'anomaly-detected': {
    descriptions: [
      'Detected unusual baseload increase of 8% in Block C',
      'Flagged HVAC running during building closure period',
      'Identified potential meter fault — consumption pattern irregular',
    ],
    avgSavingsGbp: 60,
    avgSavingsKwh: 200,
  },
  'maintenance-flag': {
    descriptions: [
      'Boiler efficiency below threshold — maintenance recommended',
      'AHU filter differential pressure high — replacement due',
      'Heat pump COP dropped below 2.5 — inspection needed',
    ],
    avgSavingsGbp: 0,
    avgSavingsKwh: 0,
  },
};

export function generateAgentAction(
  siteId: string,
  timestamp: Date,
  type?: ActionType,
): AgentAction {
  const actionTypes = Object.keys(ACTION_TEMPLATES) as ActionType[];
  const selectedType = type ?? actionTypes[Math.floor(Math.random() * actionTypes.length)];
  const template = ACTION_TEMPLATES[selectedType];
  const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
  const variance = 0.5 + Math.random();

  return {
    id: `action-${siteId}-${timestamp.getTime()}`,
    siteId,
    timestamp,
    type: selectedType,
    severity: selectedType === 'anomaly-detected' ? 'high' : selectedType === 'maintenance-flag' ? 'medium' : 'low',
    description,
    savingsGbp: Math.round(template.avgSavingsGbp * variance * 100) / 100,
    savingsKwh: Math.round(template.avgSavingsKwh * variance * 100) / 100,
    confidence: 0.75 + Math.random() * 0.2,
    automated: Math.random() > 0.3,
    status: Math.random() > 0.2 ? 'executed' : 'proposed',
  };
}

export function evaluateReadings(readings: EnergyReading[], siteId: string): AgentAction[] {
  const actions: AgentAction[] = [];

  // Check for peak demand exceedance
  const peakDemand = Math.max(...readings.map((r) => r.demandKw));
  if (peakDemand > 200) {
    actions.push(generateAgentAction(siteId, new Date(), 'demand-response'));
  }

  // Check for off-hours consumption
  const nightReadings = readings.filter((r) => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 1 && hour <= 5;
  });
  const avgNightConsumption = nightReadings.reduce((s, r) => s + r.consumptionKwh, 0) / (nightReadings.length || 1);
  if (avgNightConsumption > 10) {
    actions.push(generateAgentAction(siteId, new Date(), 'anomaly-detected'));
  }

  return actions;
}

export function getAgentSummary(actions: AgentAction[]): AgentSummary {
  const totalSavingsGbp = actions.reduce((s, a) => s + a.savingsGbp, 0);
  const totalSavingsKwh = actions.reduce((s, a) => s + a.savingsKwh, 0);
  const automated = actions.filter((a) => a.automated).length;
  const avgConfidence = actions.reduce((s, a) => s + a.confidence, 0) / (actions.length || 1);
  const siteIds = new Set(actions.map((a) => a.siteId));

  return {
    status: 'active',
    totalActions: actions.length,
    totalSavingsGbp: Math.round(totalSavingsGbp * 100) / 100,
    totalSavingsKwh: Math.round(totalSavingsKwh),
    automationRate: actions.length > 0 ? Math.round((automated / actions.length) * 100) : 0,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    activeSites: siteIds.size,
    lastAction: actions[actions.length - 1],
  };
}
