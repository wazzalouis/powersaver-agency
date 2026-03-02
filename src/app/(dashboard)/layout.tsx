'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-fusion-cream-light">
      <Sidebar />
      <PageWrapper>{children}</PageWrapper>
      <MobileNav />
    </div>
  );
}
