import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const actions = await prisma.agentAction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { site: { select: { slug: true, name: true } } },
    });

    const formatted = actions.map((a) => ({
      id: a.id,
      siteSlug: a.site.slug,
      siteName: a.site.name,
      category: a.category,
      description: a.description,
      status: a.status,
      autonomous: a.autonomous,
      estimatedSaving: a.estimatedSaving,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({ actions: formatted });
  } catch (error) {
    console.error('[AGENT_RECENT] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
