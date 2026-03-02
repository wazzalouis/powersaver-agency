'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useDashboardStore } from '@/stores/dashboard-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useDashboardStore();

  return (
    <div className="min-h-screen bg-fusion-cream-light">
      <Sidebar />
      <div
        className={`
          flex flex-col min-h-screen
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-[260px]'}
          transition-[margin] duration-300 ease-in-out
        `}
      >
        <Header />
        <PageWrapper>{children}</PageWrapper>
      </div>
      <MobileNav />
    </div>
  );
}
