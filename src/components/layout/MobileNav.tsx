'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Activity, Building2, Brain, PiggyBank } from 'lucide-react';

const mobileNavItems = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Live', href: '/realtime', icon: Activity },
  { label: 'Sites', href: '/sites', icon: Building2 },
  { label: 'Agent', href: '/agent', icon: Brain },
  { label: 'Savings', href: '/savings', icon: PiggyBank },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-fusion-cream z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-2 py-1">
              <Icon size={20} className={isActive ? 'text-fusion-primary' : 'text-fusion-text-muted'} />
              <span className={`text-[10px] ${isActive ? 'text-fusion-primary font-medium' : 'text-fusion-text-muted'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
