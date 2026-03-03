import { PrismaClient } from '@/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // Remote database (e.g. Turso libsql://) — use directly
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // Vercel serverless: copy bundled db to writable /tmp
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/dev.db';
    if (!existsSync(tmpDb)) {
      const bundledDb = join(process.cwd(), 'prisma', 'dev.db');
      if (existsSync(bundledDb)) {
        copyFileSync(bundledDb, tmpDb);
      }
    }
    return 'file:/tmp/dev.db';
  }

  // Local development
  return envUrl ?? 'file:./dev.db';
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
