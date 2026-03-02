'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Activity, Building2, Brain, PiggyBank, Settings, LogOut, Zap, User,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { AgentStatusBadge } from '@/components/brand/AgentStatusBadge';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Activity:        <Activity size={18} />,
  Building2:       <Building2 size={18} />,
  Brain:           <Brain size={18} />,
  PiggyBank:       <PiggyBank size={18} />,
  Settings:        <Settings size={18} />,
};

// Settings is admin-only
const ADMIN_ONLY_PATHS = ['/settings'];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (ADMIN_ONLY_PATHS.includes(item.href) && role !== 'ADMIN') return false;
    return true;
  });

  const roleBadge = role === 'ADMIN' ? 'Admin' : role === 'SITE_MANAGER' ? 'Site Manager' : 'Viewer';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-fusion-primary flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-[var(--fusion-radius)] bg-fusion-sage flex items-center justify-center">
          <Zap size={18} className="text-fusion-primary-dark" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-wide font-body">FUSION</h1>
          <p className="text-[10px] text-fusion-sage tracking-widest uppercase">Energy Intelligence</p>
        </div>
      </div>

      {/* Agent Status */}
      <div className="px-4 mb-4">
        <AgentStatusBadge />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-[var(--fusion-radius)] text-sm transition-colors
                  ${isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {iconMap[item.icon]}
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-fusion-sage"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Info + Sign Out */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        {session?.user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-fusion-sage/20 flex items-center justify-center">
              <User size={14} className="text-fusion-sage" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{session.user.name}</p>
              <p className="text-[10px] text-fusion-sage">{roleBadge}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors w-full"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
