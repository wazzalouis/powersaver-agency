import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Fusion Energy',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Demo credentials for presentation
        if (
          credentials?.email === 'admin@fusionstudents.co.uk' &&
          credentials?.password === 'FusionEnergy2026'
        ) {
          return {
            id: '1',
            name: 'Portfolio Manager',
            email: 'admin@fusionstudents.co.uk',
            role: 'admin',
          };
        }
        if (
          credentials?.email === 'viewer@fusionstudents.co.uk' &&
          credentials?.password === 'FusionViewer2026'
        ) {
          return {
            id: '2',
            name: 'Site Manager',
            email: 'viewer@fusionstudents.co.uk',
            role: 'viewer',
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
