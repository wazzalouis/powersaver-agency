import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays, format } from 'date-fns';

export async function GET() {
  try {
    // ── Reference timestamp ──────────────────────────────────────────────
    const latestReading = await prisma.energyReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });
    const dataTime = latestReading?.timestamp ?? new Date();
    const thirtyDaysAgo = subDays(dataTime, 30);

    // ── KPIs: 30-day agent actions ───────────────────────────────────────
    const allActions30d = await prisma.agentAction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo, lte: dataTime } },
      orderBy: { createdAt: 'asc' },
    });

    const totalActions30d = allActions30d.length;
    const autonomousCount = allActions30d.filter((a) => a.autonomous).length;
    const autonomousRate = totalActions30d > 0 ? (autonomousCount / totalActions30d) * 100 : 0;

    // Active weekly savings = sum of estimatedSaving for active/completed actions
    const activeActions = allActions30d.filter(
      (a) => a.status === 'COMPLETED' || a.status === 'IN_PROGRESS',
    );
    const cumulativeWeeklySavings = activeActions.reduce((sum, a) => sum + a.estimatedSaving, 0);
    const annualisedSavings = cumulativeWeeklySavings * 52;

    // ── Fetch all alerts ─────────────────────────────────────────────────
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      include: { site: { select: { slug: true, name: true } } },
      take: 200,
    });

    // ── Fetch all agent actions ──────────────────────────────────────────
    const agentActions = await prisma.agentAction.findMany({
      orderBy: { createdAt: 'desc' },
      include: { site: { select: { slug: true, name: true } } },
      take: 200,
    });

    // ── Merge into unified items ─────────────────────────────────────────
    const items = [
      ...alerts.map((a) => ({
        id: a.id,
        type: 'alert' as const,
        siteSlug: a.site.slug,
        siteName: a.site.name,
        severity: a.severity,
        category: a.category,
        title: a.title,
        description: a.message,
        agentAction: a.agentAction,
        agentReasoning: null as string | null,
        estimatedSaving: a.estimatedSaving,
        status: a.status,
        autonomous: !!a.agentAction,
        createdAt: a.createdAt.toISOString(),
        resolvedAt: a.resolvedAt?.toISOString() ?? null,
      })),
      ...agentActions.map((a) => ({
        id: a.id,
        type: 'action' as const,
        siteSlug: a.site.slug,
        siteName: a.site.name,
        severity: inferSeverity(a.category, a.status),
        category: a.category,
        title: `${a.category} Optimisation`,
        description: a.description,
        agentAction: a.actionTaken,
        agentReasoning: a.reasoning,
        estimatedSaving: a.estimatedSaving,
        status: mapActionToAlertStatus(a.status),
        autonomous: a.autonomous,
        createdAt: a.createdAt.toISOString(),
        resolvedAt: a.completedAt?.toISOString() ?? null,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // ── Timeline: daily cumulative savings (30 days) ─────────────────────
    const timeline = buildTimeline(allActions30d);

    // ── Sites for filter dropdown ────────────────────────────────────────
    const sites = await prisma.site.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      kpis: {
        totalActions30d,
        autonomousRate: Math.round(autonomousRate * 10) / 10,
        cumulativeWeeklySavings: Math.round(cumulativeWeeklySavings),
        annualisedSavings: Math.round(annualisedSavings),
      },
      items,
      timeline,
      sites: sites.map((s) => ({ slug: s.slug, name: s.name })),
      timestamp: dataTime.toISOString(),
    });
  } catch (error) {
    console.error('[AGENT_GET] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── PATCH: Update alert/action status ──────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { id, type, action: actionType } = body as {
      id: string;
      type: 'alert' | 'action';
      action: 'approve' | 'override' | 'dismiss' | 'escalate';
    };

    if (type === 'alert') {
      const statusMap: Record<string, 'RESOLVED' | 'DISMISSED' | 'HUMAN_REVIEW'> = {
        approve: 'RESOLVED',
        override: 'RESOLVED',
        dismiss: 'DISMISSED',
        escalate: 'HUMAN_REVIEW',
      };
      await prisma.alert.update({
        where: { id },
        data: {
          status: statusMap[actionType],
          resolvedAt: ['approve', 'override', 'dismiss'].includes(actionType) ? new Date() : undefined,
          humanReviewedAt: new Date(),
          humanReviewedBy: 'admin',
        },
      });
    } else {
      const statusMap: Record<string, 'COMPLETED' | 'OVERRIDDEN' | 'FAILED' | 'PENDING'> = {
        approve: 'COMPLETED',
        override: 'OVERRIDDEN',
        dismiss: 'FAILED',
        escalate: 'PENDING',
      };
      await prisma.agentAction.update({
        where: { id },
        data: {
          status: statusMap[actionType],
          completedAt: ['approve', 'override'].includes(actionType) ? new Date() : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AGENT_PATCH] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function inferSeverity(category: string, status: string): string {
  if (status === 'FAILED') return 'CRITICAL';
  if (['BOILER', 'MAINTENANCE'].includes(category)) return 'WARNING';
  if (category === 'HVAC' && status === 'IN_PROGRESS') return 'WARNING';
  return 'INFO';
}

function mapActionToAlertStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'OPEN',
    IN_PROGRESS: 'AGENT_ACTING',
    COMPLETED: 'RESOLVED',
    FAILED: 'OPEN',
    OVERRIDDEN: 'HUMAN_REVIEW',
  };
  return map[status] ?? 'OPEN';
}

function buildTimeline(
  actions: Array<{
    createdAt: Date;
    estimatedSaving: number;
    category: string;
    description: string;
    id: string;
  }>,
) {
  const dayMap = new Map<
    string,
    Array<{ id: string; category: string; description: string; saving: number }>
  >();

  for (const a of actions) {
    const day = format(a.createdAt, 'yyyy-MM-dd');
    const existing = dayMap.get(day) || [];
    existing.push({
      id: a.id,
      category: a.category,
      description: a.description,
      saving: a.estimatedSaving,
    });
    dayMap.set(day, existing);
  }

  const sorted = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  let cumulative = 0;

  return sorted.map(([date, dayActions]) => {
    const daySaving = dayActions.reduce((sum, a) => sum + a.saving, 0);
    cumulative += daySaving;
    return {
      date,
      dateLabel: format(new Date(date + 'T12:00:00'), 'dd MMM'),
      daySaving: Math.round(daySaving),
      cumulativeSavings: Math.round(cumulative),
      actions: dayActions,
    };
  });
}
