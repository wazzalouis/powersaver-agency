'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Activity, Building2, Bot, Settings } from 'lucide-react';

const mobileNavItems = [
  { label: 'Overview', href: '/overview',  icon: LayoutDashboard },
  { label: 'Live',     href: '/realtime',  icon: Activity },
  { label: 'Sites',    href: '/sites',     icon: Building2 },
  { label: 'Agent',    href: '/agent',     icon: Bot },
  { label: 'Settings', href: '/settings',  icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-fusion-cream z-50 lg:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-0"
            >
              <Icon size={20} className={isActive ? 'text-fusion-copper' : 'text-fusion-text-muted'} />
              <span
                className={`text-[10px] truncate ${
                  isActive ? 'text-fusion-copper font-medium' : 'text-fusion-text-muted'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
