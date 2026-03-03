import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── Field labels for audit log readability ──────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  agentActive: 'AI Agent Active',
  globalAutonomy: 'Global Autonomy Level',
};

const NOTIFICATION_LABELS: Record<string, string> = {
  alertLevel: 'Alert Level',
  recipientEmails: 'Notification Recipients',
  dailyDigest: 'Daily Digest',
  dailyDigestTime: 'Daily Digest Time',
  weeklyReport: 'Weekly Report',
  weeklyReportDay: 'Weekly Report Day',
};

const SITE_LABELS: Record<string, string> = {
  hvacAutoSchedule: 'HVAC Auto-Schedule',
  voidRoomDetection: 'Void Room Detection',
  peakAvoidance: 'Peak Tariff Avoidance',
  lightingAutomation: 'Lighting Automation',
  boilerOptimisation: 'Boiler Optimisation',
  waterHeatingOpt: 'Water Heating Optimisation',
  maxAutonomyLevel: 'Site Autonomy Level',
  hvacMinTemp: 'HVAC Min Temperature',
  hvacMaxTemp: 'HVAC Max Temperature',
  nightModeStart: 'Night Mode Start',
  nightModeEnd: 'Night Mode End',
  peakTariffThreshold: 'Peak Tariff Threshold',
};

// ── GET — return all settings ───────────────────────────────────────────────

export async function GET() {
  try {
    const [platform, notifications, agentConfigs] = await Promise.all([
      prisma.platformSettings.findFirst(),
      prisma.notificationPreferences.findFirst(),
      prisma.agentConfig.findMany({
        include: { site: { select: { id: true, name: true, slug: true } } },
        orderBy: { site: { name: 'asc' } },
      }),
    ]);

    const platformData = platform ?? { agentActive: true, globalAutonomy: 3 };
    const notificationData = notifications ?? {
      alertLevel: 'CRITICAL',
      recipientEmails: '[]',
      dailyDigest: false,
      dailyDigestTime: '08:00',
      weeklyReport: true,
      weeklyReportDay: 'MONDAY',
    };

    return NextResponse.json({
      platform: {
        agentActive: platformData.agentActive,
        globalAutonomy: platformData.globalAutonomy,
      },
      notifications: {
        alertLevel: notificationData.alertLevel,
        recipientEmails: JSON.parse(
          typeof notificationData.recipientEmails === 'string'
            ? notificationData.recipientEmails
            : '[]',
        ),
        dailyDigest: notificationData.dailyDigest,
        dailyDigestTime: notificationData.dailyDigestTime,
        weeklyReport: notificationData.weeklyReport,
        weeklyReportDay: notificationData.weeklyReportDay,
      },
      sites: agentConfigs.map((c) => ({
        siteId: c.siteId,
        siteName: c.site.name,
        siteSlug: c.site.slug,
        hvacAutoSchedule: c.hvacAutoSchedule,
        voidRoomDetection: c.voidRoomDetection,
        peakAvoidance: c.peakAvoidance,
        lightingAutomation: c.lightingAutomation,
        boilerOptimisation: c.boilerOptimisation,
        waterHeatingOpt: c.waterHeatingOpt,
        maxAutonomyLevel: c.maxAutonomyLevel,
        hvacMinTemp: c.hvacMinTemp,
        hvacMaxTemp: c.hvacMaxTemp,
        nightModeStart: c.nightModeStart,
        nightModeEnd: c.nightModeEnd,
        peakTariffThreshold: c.peakTariffThreshold,
      })),
    });
  } catch (error) {
    console.error('[SETTINGS_GET] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── PATCH — save changes with audit logging ─────────────────────────────────

interface AuditEntry {
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  previousValue: string;
  newValue: string;
}

export async function PATCH(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { platform, notifications, sites, userId, userName } = body as {
    platform?: { agentActive?: boolean; globalAutonomy?: number };
    notifications?: {
      alertLevel?: string;
      recipientEmails?: string[];
      dailyDigest?: boolean;
      dailyDigestTime?: string;
      weeklyReport?: boolean;
      weeklyReportDay?: string;
    };
    sites?: Array<{
      siteId: string;
      siteName?: string;
      [key: string]: unknown;
    }>;
    userId: string;
    userName: string;
  };

  const auditEntries: AuditEntry[] = [];

  // 1. Platform settings
  if (platform) {
    const previous = await prisma.platformSettings.findFirst();
    const prevData = {
      agentActive: previous?.agentActive ?? true,
      globalAutonomy: previous?.globalAutonomy ?? 3,
    };

    await prisma.platformSettings.upsert({
      where: { id: 'platform' },
      update: platform,
      create: { id: 'platform', ...platform },
    });

    for (const [key, newVal] of Object.entries(platform)) {
      const prevVal = prevData[key as keyof typeof prevData];
      if (prevVal !== undefined && String(prevVal) !== String(newVal)) {
        auditEntries.push({
          userId,
          userName,
          action: `Updated ${PLATFORM_LABELS[key] ?? key}`,
          entity: 'PlatformSettings',
          entityId: 'platform',
          previousValue: String(prevVal),
          newValue: String(newVal),
        });
      }
    }
  }

  // 2. Notification preferences
  if (notifications) {
    const previous = await prisma.notificationPreferences.findFirst();
    const prevData = {
      alertLevel: previous?.alertLevel ?? 'CRITICAL',
      recipientEmails: previous?.recipientEmails ?? '[]',
      dailyDigest: previous?.dailyDigest ?? false,
      dailyDigestTime: previous?.dailyDigestTime ?? '08:00',
      weeklyReport: previous?.weeklyReport ?? true,
      weeklyReportDay: previous?.weeklyReportDay ?? 'MONDAY',
    };

    const dataToSave: Record<string, unknown> = { ...notifications };
    if (notifications.recipientEmails) {
      dataToSave.recipientEmails = JSON.stringify(notifications.recipientEmails);
    }

    await prisma.notificationPreferences.upsert({
      where: { id: 'notifications' },
      update: dataToSave,
      create: { id: 'notifications', ...dataToSave },
    });

    for (const [key, newVal] of Object.entries(notifications)) {
      const prevRaw = prevData[key as keyof typeof prevData];
      const prevStr =
        key === 'recipientEmails'
          ? prevRaw
          : String(prevRaw);
      const newStr =
        key === 'recipientEmails'
          ? JSON.stringify(newVal)
          : String(newVal);

      if (prevStr !== newStr) {
        auditEntries.push({
          userId,
          userName,
          action: `Updated ${NOTIFICATION_LABELS[key] ?? key}`,
          entity: 'NotificationPreferences',
          entityId: 'notifications',
          previousValue: String(prevStr),
          newValue: String(newStr),
        });
      }
    }
  }

  // 3. Per-site configs
  if (sites && Array.isArray(sites)) {
    for (const siteUpdate of sites) {
      const { siteId, siteName, ...data } = siteUpdate;
      const previous = await prisma.agentConfig.findUnique({
        where: { siteId: siteId as string },
      });

      if (!previous) continue;

      // Build the update payload with only recognized fields
      const updateData: Record<string, unknown> = {};
      const configKeys = Object.keys(SITE_LABELS);
      for (const key of configKeys) {
        if (key in data) {
          updateData[key] = data[key];
        }
      }

      if (Object.keys(updateData).length === 0) continue;

      await prisma.agentConfig.update({
        where: { siteId: siteId as string },
        data: updateData,
      });

      for (const [key, newVal] of Object.entries(updateData)) {
        const prevVal = previous[key as keyof typeof previous];
        if (prevVal !== undefined && String(prevVal) !== String(newVal)) {
          auditEntries.push({
            userId,
            userName,
            action: `Updated ${SITE_LABELS[key] ?? key}`,
            entity: 'AgentConfig',
            entityId: String(siteName ?? siteId),
            previousValue: String(prevVal),
            newValue: String(newVal),
          });
        }
      }
    }
  }

    // 4. Insert audit entries
    if (auditEntries.length > 0) {
      await prisma.auditLog.createMany({ data: auditEntries });
    }

    return NextResponse.json({ success: true, changesCount: auditEntries.length });
  } catch (error) {
    console.error('[SETTINGS_PATCH] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
