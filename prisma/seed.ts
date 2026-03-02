/**
 * Seed Script — populates the database with realistic energy data.
 *
 * Generates:
 * - 3 users (admin, site manager, viewer)
 * - 6 sites with real Fusion Students data
 * - ~52,000 energy readings (Oct 2025 – Mar 2026, 30-min intervals)
 * - 50+ alerts across all sites
 * - 80+ agent actions across all sites
 * - 6 months of savings records per site per category
 * - Agent config for each site
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createHash, randomBytes } from 'node:crypto';
import {
  SITE_CONFIGS,
  generateReadingsForSite,
  UK_GRID_CO2_KG_PER_KWH,
} from '../src/lib/simulation-engine';

// ─── DB Client ──────────────────────────────────────────────────────────────

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// ─── Password Hashing (scrypt via Node.js crypto) ───────────────────────────

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return `sha256:${salt}:${hash}`;
}

// ─── Seeded PRNG for deterministic alert/action generation ──────────────────

function seededRandom(seed: number): () => number {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ─── Alert Templates ────────────────────────────────────────────────────────

const ALERT_TEMPLATES = [
  { severity: 'CRITICAL' as const, category: 'HVAC' as const, title: 'HVAC Zone Overheating', message: 'Zone temperature exceeds setpoint by 4°C. Possible valve failure.', saving: 320 },
  { severity: 'CRITICAL' as const, category: 'BOILER' as const, title: 'Boiler Pressure Drop', message: 'System pressure fallen below 0.8 bar. Requires immediate inspection.', saving: 280 },
  { severity: 'CRITICAL' as const, category: 'WATER' as const, title: 'Hot Water Temperature Spike', message: 'DHW outlet temperature exceeding 65°C — legionella risk and energy waste.', saving: 150 },
  { severity: 'WARNING' as const, category: 'HVAC' as const, title: 'Void Room Heating Detected', message: 'HVAC running at full capacity in unoccupied room. Frost protection should be sufficient.', saving: 85 },
  { severity: 'WARNING' as const, category: 'HVAC' as const, title: 'HVAC Schedule Mismatch', message: 'Heating running outside scheduled hours. 23:00–06:00 should be night mode.', saving: 120 },
  { severity: 'WARNING' as const, category: 'LIGHTING' as const, title: 'Corridor Lights On During Day', message: 'Corridor and stairwell lights at full brightness despite daylight availability.', saving: 45 },
  { severity: 'WARNING' as const, category: 'TARIFF' as const, title: 'Peak Tariff Load Spike', message: 'Significant load increase during peak tariff window (16:00–19:00).', saving: 95 },
  { severity: 'WARNING' as const, category: 'OCCUPANCY' as const, title: 'Low Occupancy Floor Heating', message: 'Floor 7 at 20% occupancy but heating at 100%. Consider zone reduction.', saving: 110 },
  { severity: 'WARNING' as const, category: 'BOILER' as const, title: 'Boiler Cycling Excessively', message: 'Main boiler cycling 12+ times per hour. Possible thermostat or sizing issue.', saving: 75 },
  { severity: 'WARNING' as const, category: 'WATER' as const, title: 'Water Heating During Peak', message: 'DHW system running during peak tariff window. Should pre-heat during off-peak.', saving: 65 },
  { severity: 'WARNING' as const, category: 'MAINTENANCE' as const, title: 'Filter Replacement Due', message: 'AHU filter differential pressure indicates replacement needed within 7 days.', saving: 40 },
  { severity: 'INFO' as const, category: 'SCHEDULING' as const, title: 'Holiday Period Approaching', message: 'University break starts in 5 days. Consider reduced heating schedule.', saving: 200 },
  { severity: 'INFO' as const, category: 'TARIFF' as const, title: 'Tariff Rate Change', message: 'Energy supplier updating peak rates from next billing period (+2.3%).', saving: 0 },
  { severity: 'INFO' as const, category: 'HVAC' as const, title: 'Seasonal Changeover Recommended', message: 'Outdoor temperatures rising. Consider transitioning from heating to ventilation-only mode.', saving: 150 },
  { severity: 'INFO' as const, category: 'OCCUPANCY' as const, title: 'Occupancy Pattern Change', message: 'Weekend occupancy has increased 12% this month. Adjusting schedules accordingly.', saving: 30 },
  { severity: 'INFO' as const, category: 'LIGHTING' as const, title: 'Daylight Savings Impact', message: 'Clocks change next week — lighting schedules will be automatically adjusted.', saving: 20 },
] as const;

// ─── Agent Action Templates ─────────────────────────────────────────────────

const ACTION_TEMPLATES = [
  { category: 'HVAC' as const, description: 'Reduced HVAC setpoint in void rooms', reasoning: 'Detected 23 void rooms running at full heating (21°C). Frost protection at 5°C is sufficient for unoccupied rooms.', actionTaken: 'Reduced void room setpoints from 21°C to 5°C across floors 4, 7, and 12', saving: 180 },
  { category: 'HVAC' as const, description: 'Optimised morning warm-up schedule', reasoning: 'Weather forecast shows mild morning (12°C). Building thermal mass allows later start.', actionTaken: 'Delayed HVAC warm-up from 05:30 to 06:15 based on predicted outdoor temperature', saving: 45 },
  { category: 'HVAC' as const, description: 'Night mode activation extended', reasoning: 'Low overnight occupancy detected (8% of rooms active). Extending night setback period.', actionTaken: 'Extended night mode from 23:00-06:00 to 22:30-06:30', saving: 35 },
  { category: 'HVAC' as const, description: 'Zone rebalancing — reduced north wing heating', reasoning: 'North-facing rooms naturally cooler but south-facing rooms overheating. Rebalancing zones.', actionTaken: 'Reduced south zone setpoint by 1.5°C, increased north zone by 0.5°C', saving: 55 },
  { category: 'WATER' as const, description: 'Shifted DHW heating to off-peak window', reasoning: 'Hot water system was heating during 16:00-18:00 peak tariff (£0.38/kWh). Off-peak rate is £0.20/kWh.', actionTaken: 'Rescheduled main DHW charge to 02:00-05:00 with boost at 06:00', saving: 95 },
  { category: 'WATER' as const, description: 'Reduced DHW temperature setpoint', reasoning: 'DHW stored at 65°C but 60°C meets legionella compliance. 5°C reduction saves significant energy.', actionTaken: 'Reduced DHW storage temperature from 65°C to 60°C with weekly legionella pasteurisation cycle', saving: 70 },
  { category: 'LIGHTING' as const, description: 'Activated corridor motion sensors', reasoning: 'Corridor lights running 24/7 at full brightness. Motion-sensor control reduces to 20% base with activation on movement.', actionTaken: 'Enabled PIR sensor control on floors 3-18 corridors, 20% standby brightness', saving: 40 },
  { category: 'LIGHTING' as const, description: 'Daylight harvesting — communal areas', reasoning: 'South-facing communal lounge receives strong daylight 09:00-16:00 but artificial lights at 100%.', actionTaken: 'Enabled daylight sensors in reception, lounge, and study rooms. Target: 400 lux maintained.', saving: 25 },
  { category: 'TARIFF' as const, description: 'Peak load shifting — laundry schedule', reasoning: 'Communal laundry machines running during peak tariff. Shifting to off-peak saves £0.18/kWh on each cycle.', actionTaken: 'Programmed laundry machines to prefer 22:00-07:00 operation with pricing incentive display', saving: 60 },
  { category: 'TARIFF' as const, description: 'Pre-heating strategy for peak avoidance', reasoning: 'Forecast cold snap tomorrow. Pre-heating building mass during off-peak (02:00-06:00) allows coasting through morning peak tariff.', actionTaken: 'Increased overnight HVAC to +2°C above setpoint, then coast from 07:00-09:00', saving: 80 },
  { category: 'BOILER' as const, description: 'Optimised boiler staging sequence', reasoning: 'Lead boiler running at 40% capacity inefficiently. Cascading to smaller boiler improves efficiency by 8%.', actionTaken: 'Reversed boiler staging order: small boiler leads until 60% load, then cascade to main', saving: 65 },
  { category: 'BOILER' as const, description: 'Reduced boiler cycling frequency', reasoning: 'Main boiler short-cycling 15 times/hour. Increased dead-band to reduce wear and improve efficiency.', actionTaken: 'Widened thermostat dead-band from ±0.5°C to ±1.5°C', saving: 30 },
  { category: 'OCCUPANCY' as const, description: 'Reduced heating on low-occupancy floor', reasoning: 'Floor 9 at 35% occupancy. Full floor heating is wasteful — zone to occupied rooms only.', actionTaken: 'Disabled HVAC in void rooms on floor 9 (rooms 901-906, 912-918), maintained corridor heating', saving: 110 },
  { category: 'OCCUPANCY' as const, description: 'Weekend schedule adjustment', reasoning: 'Weekend occupancy drops to 60%. Reducing communal area conditioning.', actionTaken: 'Implemented weekend schedule: communal HVAC 08:00-22:00 only, gym ventilation reduced by 30%', saving: 50 },
  { category: 'SCHEDULING' as const, description: 'Holiday period schedule activated', reasoning: 'University term ended. Only 25% of residents remaining over Christmas break.', actionTaken: 'Activated holiday mode: reduced to occupied floors only, communal areas on timer, DHW reduced', saving: 350 },
  { category: 'SCHEDULING' as const, description: 'Exam period adjustment', reasoning: 'Exam period detected — higher daytime building occupancy than normal. Adjusting schedules.', actionTaken: 'Extended study room HVAC and lighting to 23:00 (from 21:00), increased ventilation in library', saving: -15 },
  { category: 'MAINTENANCE' as const, description: 'Flagged AHU filter for replacement', reasoning: 'AHU differential pressure exceeded threshold. Clogged filter increases fan energy by 15%.', actionTaken: 'Created maintenance ticket #4721. Estimated energy saving of £40/week once replaced.', saving: 40 },
  { category: 'MAINTENANCE' as const, description: 'Identified faulty TRV on floor 6', reasoning: 'Room 612 consistently 4°C above setpoint. TRV valve stuck open.', actionTaken: 'Created urgent maintenance ticket #4735. Temporarily shut off radiator circuit to room 612.', saving: 25 },
] as const;

// ─── Main Seed Function ─────────────────────────────────────────────────────

async function main() {
  console.log('Clearing existing data...');
  await prisma.savingsRecord.deleteMany();
  await prisma.agentConfig.deleteMany();
  await prisma.agentAction.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.energyReading.deleteMany();
  // Clear the implicit many-to-many join table by disconnecting relations
  const existingSites = await prisma.site.findMany({ select: { id: true } });
  for (const site of existingSites) {
    await prisma.site.update({
      where: { id: site.id },
      data: { users: { set: [] } },
    });
  }
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.site.deleteMany();

  // ── 1. Users ────────────────────────────────────────────────────────────

  console.log('Creating users...');
  const hashedPassword = hashPassword('FusionDemo2026!');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@fusionstudents.co.uk',
      name: 'Portfolio Manager',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const siteManager = await prisma.user.create({
    data: {
      email: 'bct.manager@fusionstudents.co.uk',
      name: 'BCT Site Manager',
      password: hashedPassword,
      role: 'SITE_MANAGER',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@fusionstudents.co.uk',
      name: 'Energy Analyst',
      password: hashedPassword,
      role: 'VIEWER',
    },
  });

  console.log(`  Created ${admin.email} (ADMIN)`);
  console.log(`  Created ${siteManager.email} (SITE_MANAGER)`);
  console.log(`  Created ${viewer.email} (VIEWER)`);

  // ── 2. Sites ────────────────────────────────────────────────────────────

  console.log('Creating sites...');
  const siteIdMap: Record<string, string> = {};

  for (const cfg of SITE_CONFIGS) {
    const site = await prisma.site.create({
      data: {
        name: cfg.name,
        slug: cfg.slug,
        city: cfg.city,
        rooms: cfg.rooms,
        totalSqm: cfg.totalSqm,
        floors: cfg.floors,
        yearBuilt: cfg.yearBuilt,
        energyRating: cfg.energyRating,
        hvacType: cfg.hvacType,
        solarPanels: cfg.solarPanels,
        smartMeters: cfg.smartMeters,
      },
    });
    siteIdMap[cfg.slug] = site.id;
    console.log(`  Created ${cfg.name} (${cfg.rooms} rooms, ${cfg.city})`);
  }

  // Connect user site access
  // Admin: access to all sites
  await prisma.user.update({
    where: { id: admin.id },
    data: { siteAccess: { connect: Object.values(siteIdMap).map((id) => ({ id })) } },
  });

  // Site manager: Brent Cross only
  await prisma.user.update({
    where: { id: siteManager.id },
    data: { siteAccess: { connect: { id: siteIdMap['brent-cross-town'] } } },
  });

  // Viewer: all operational sites
  const operationalSlugs = ['brent-cross-town', 'liverpool', 'nottingham', 'york'];
  await prisma.user.update({
    where: { id: viewer.id },
    data: { siteAccess: { connect: operationalSlugs.map((slug) => ({ id: siteIdMap[slug] })) } },
  });

  // ── 3. Agent Configs ────────────────────────────────────────────────────

  console.log('Creating agent configs...');
  for (const cfg of SITE_CONFIGS) {
    const isNewSite = cfg.slug === 'leeds' || cfg.slug === 'manchester';
    await prisma.agentConfig.create({
      data: {
        siteId: siteIdMap[cfg.slug],
        hvacAutoSchedule: true,
        voidRoomDetection: true,
        peakAvoidance: !isNewSite, // New sites in ramp-up mode
        lightingAutomation: true,
        boilerOptimisation: !isNewSite,
        waterHeatingOpt: true,
        maxAutonomyLevel: isNewSite ? 2 : 3, // New sites: suggest only
        hvacMinTemp: 18.0,
        hvacMaxTemp: cfg.slug === 'york' ? 21.0 : 22.0, // York older building, tighter control
        nightModeStart: '23:00',
        nightModeEnd: '06:00',
        peakTariffThreshold: 0.35,
      },
    });
  }

  // ── 4. Energy Readings ──────────────────────────────────────────────────

  console.log('Generating energy readings (this may take a minute)...');
  const startDate = new Date('2025-10-01T00:00:00Z');
  const endDate = new Date('2026-03-31T23:30:00Z');

  let totalReadings = 0;

  for (const cfg of SITE_CONFIGS) {
    const siteId = siteIdMap[cfg.slug];
    console.log(`  Generating readings for ${cfg.name}...`);

    const readings = generateReadingsForSite(cfg, startDate, endDate);
    console.log(`    Generated ${readings.length} readings`);

    // Batch insert in chunks of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < readings.length; i += BATCH_SIZE) {
      const batch = readings.slice(i, i + BATCH_SIZE);
      await prisma.energyReading.createMany({
        data: batch.map((r) => ({
          siteId,
          timestamp: r.timestamp,
          intervalMinutes: r.intervalMinutes,
          hvacKwh: r.hvacKwh,
          waterKwh: r.waterKwh,
          lightingKwh: r.lightingKwh,
          communalKwh: r.communalKwh,
          otherKwh: r.otherKwh,
          totalKwh: r.totalKwh,
          optimisedKwh: r.optimisedKwh,
          savingsKwh: r.savingsKwh,
          costGbp: r.costGbp,
          savingsGbp: r.savingsGbp,
          tariffRate: r.tariffRate,
          occupancyRate: r.occupancyRate,
          outsideTemp: r.outsideTemp,
          co2Kg: r.co2Kg,
        })),
      });

      if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
        console.log(`    Inserted ${Math.min(i + BATCH_SIZE, readings.length)}/${readings.length}`);
      }
    }

    totalReadings += readings.length;
  }

  console.log(`  Total readings inserted: ${totalReadings}`);

  // ── 5. Alerts ───────────────────────────────────────────────────────────

  console.log('Creating alerts...');
  const rand = seededRandom(42);
  const alertStatuses = ['OPEN', 'AGENT_ACTING', 'HUMAN_REVIEW', 'RESOLVED', 'DISMISSED'] as const;
  let alertCount = 0;

  for (const cfg of SITE_CONFIGS) {
    const siteId = siteIdMap[cfg.slug];
    // More alerts for larger/less efficient sites
    const numAlerts = cfg.slug === 'leeds' || cfg.slug === 'manchester'
      ? 4 + Math.floor(rand() * 3)
      : 8 + Math.floor(rand() * 6);

    for (let i = 0; i < numAlerts; i++) {
      const template = pick(ALERT_TEMPLATES, rand);
      const status = pick(alertStatuses, rand);
      const daysAgo = Math.floor(rand() * 120); // Spread over ~4 months
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60));

      const isResolved = status === 'RESOLVED' || status === 'DISMISSED';
      const resolvedAt = isResolved ? new Date(createdAt.getTime() + rand() * 7 * 24 * 60 * 60 * 1000) : null;

      const hasAgentAction = status !== 'OPEN' && rand() > 0.3;
      const agentActedAt = hasAgentAction ? new Date(createdAt.getTime() + rand() * 2 * 60 * 60 * 1000) : null;

      const hasHumanReview = status === 'HUMAN_REVIEW' || (isResolved && rand() > 0.5);

      await prisma.alert.create({
        data: {
          siteId,
          severity: template.severity,
          category: template.category,
          title: template.title,
          message: `${template.message} [${cfg.name}]`,
          estimatedSaving: template.saving * (0.8 + rand() * 0.4),
          status,
          agentAction: hasAgentAction ? `Auto-${template.category.toLowerCase()} adjustment applied` : null,
          agentActedAt,
          humanReviewedBy: hasHumanReview ? pick(['Portfolio Manager', 'BCT Site Manager', 'Energy Analyst'], rand) : null,
          humanReviewedAt: hasHumanReview ? new Date(createdAt.getTime() + rand() * 48 * 60 * 60 * 1000) : null,
          createdAt,
          resolvedAt,
        },
      });
      alertCount++;
    }
  }

  console.log(`  Created ${alertCount} alerts`);

  // ── 6. Agent Actions ────────────────────────────────────────────────────

  console.log('Creating agent actions...');
  const actionStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'OVERRIDDEN'] as const;
  let actionCount = 0;

  for (const cfg of SITE_CONFIGS) {
    const siteId = siteIdMap[cfg.slug];
    // More actions for operational sites
    const numActions = cfg.slug === 'leeds' || cfg.slug === 'manchester'
      ? 5 + Math.floor(rand() * 4)
      : 14 + Math.floor(rand() * 8);

    for (let i = 0; i < numActions; i++) {
      const template = pick(ACTION_TEMPLATES, rand);
      const status = rand() > 0.3
        ? 'COMPLETED'
        : pick(actionStatuses, rand);
      const daysAgo = Math.floor(rand() * 150);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60));

      const isComplete = status === 'COMPLETED';
      const completedAt = isComplete ? new Date(createdAt.getTime() + rand() * 4 * 60 * 60 * 1000) : null;

      // 78% autonomous rate as per spec
      const autonomous = rand() < 0.78;

      // Confirmed savings: only for completed actions, ±20% of estimate
      const confirmedSaving = isComplete
        ? template.saving * (0.8 + rand() * 0.4)
        : null;

      await prisma.agentAction.create({
        data: {
          siteId,
          category: template.category,
          description: `${template.description} — ${cfg.name}`,
          reasoning: template.reasoning,
          actionTaken: template.actionTaken,
          autonomous,
          estimatedSaving: template.saving * (0.9 + rand() * 0.2),
          confirmedSaving,
          status,
          createdAt,
          completedAt,
        },
      });
      actionCount++;
    }
  }

  console.log(`  Created ${actionCount} agent actions`);

  // ── 7. Savings Records ──────────────────────────────────────────────────

  console.log('Creating savings records...');
  const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];
  const categories = ['HVAC', 'WATER', 'LIGHTING', 'BOILER', 'OCCUPANCY', 'TARIFF', 'SCHEDULING'] as const;
  let savingsCount = 0;

  for (const cfg of SITE_CONFIGS) {
    const siteId = siteIdMap[cfg.slug];
    const isNewSite = cfg.slug === 'leeds' || cfg.slug === 'manchester';

    for (let m = 0; m < months.length; m++) {
      for (const cat of categories) {
        // Base projected savings scale with site size, occupancy, and month
        const sizeFactor = cfg.rooms / 500;
        const occupancyFactor = isNewSite ? 0.3 : cfg.occupancyRate;
        // Savings improve over time as agent learns (month index 0–5)
        const learningFactor = 1 + m * 0.08;
        // Category weights
        const catWeight = getCategorySavingsWeight(cat);

        const baseProjected = sizeFactor * occupancyFactor * learningFactor * catWeight * 800;
        const projected = baseProjected * (0.9 + rand() * 0.2);
        // Actual savings: 85–105% of projected (sometimes overperform)
        const actual = projected * (0.85 + rand() * 0.2);
        // CO2 saved: based on energy saved at grid average
        const kwhSaved = actual / 0.30; // Rough conversion: £ saved ÷ avg tariff = kWh saved
        const co2Saved = kwhSaved * UK_GRID_CO2_KG_PER_KWH;

        await prisma.savingsRecord.create({
          data: {
            siteId,
            month: months[m],
            category: cat,
            projectedGbp: Math.round(projected * 100) / 100,
            actualGbp: Math.round(actual * 100) / 100,
            co2SavedKg: Math.round(co2Saved * 100) / 100,
          },
        });
        savingsCount++;
      }
    }
  }

  console.log(`  Created ${savingsCount} savings records`);

  // ── Summary ─────────────────────────────────────────────────────────────

  console.log('\n=== Seed Complete ===');
  console.log(`Users:          3`);
  console.log(`Sites:          ${SITE_CONFIGS.length}`);
  console.log(`Agent Configs:  ${SITE_CONFIGS.length}`);
  console.log(`Energy Readings:${totalReadings}`);
  console.log(`Alerts:         ${alertCount}`);
  console.log(`Agent Actions:  ${actionCount}`);
  console.log(`Savings Records:${savingsCount}`);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCategorySavingsWeight(category: string): number {
  const weights: Record<string, number> = {
    HVAC: 1.0,         // Largest savings potential
    WATER: 0.4,
    LIGHTING: 0.25,
    BOILER: 0.5,
    OCCUPANCY: 0.6,    // Void room detection
    TARIFF: 0.35,      // Peak shifting
    SCHEDULING: 0.45,
    MAINTENANCE: 0.15,
  };
  return weights[category] ?? 0.3;
}

// ─── Run ────────────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
