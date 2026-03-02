import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createHash } from 'node:crypto';
import { prisma } from './prisma';

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'sha256') return false;
  const salt = parts[1];
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return hash === parts[2];
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Fusion Energy',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { siteAccess: { select: { id: true, slug: true } } },
        });

        if (!user || !verifyPassword(credentials.password, user.password)) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          siteIds: user.siteAccess.map((s) => s.id),
          siteSlugs: user.siteAccess.map((s) => s.slug),
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.siteIds = user.siteIds;
        token.siteSlugs = user.siteSlugs;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.siteIds = token.siteIds;
      session.user.siteSlugs = token.siteSlugs;
      return session;
    },
  },
};
