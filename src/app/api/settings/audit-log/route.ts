import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '15', 10);
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        userId: e.userId,
        userName: e.userName,
        action: e.action,
        entity: e.entity,
        entityId: e.entityId,
        previousValue: e.previousValue,
        newValue: e.newValue,
        createdAt: e.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[AUDIT_LOG] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
