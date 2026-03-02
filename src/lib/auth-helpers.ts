'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return {
    session,
    status,
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    role: user?.role as 'ADMIN' | 'SITE_MANAGER' | 'VIEWER' | undefined,
    siteIds: user?.siteIds ?? [],
    siteSlugs: user?.siteSlugs ?? [],
    isAdmin: user?.role === 'ADMIN',
    isSiteManager: user?.role === 'SITE_MANAGER',
    isViewer: user?.role === 'VIEWER',
    canManageAgent: user?.role === 'ADMIN',
    canAcknowledgeAlerts: user?.role === 'ADMIN' || user?.role === 'SITE_MANAGER',
    canAccessSite: (siteIdOrSlug: string) =>
      user?.role === 'ADMIN' || user?.role === 'VIEWER'
      || (user?.siteIds ?? []).includes(siteIdOrSlug)
      || (user?.siteSlugs ?? []).includes(siteIdOrSlug),
  };
}
