'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Building2, Bot, TrendingUp, Settings,
  LogOut, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { useAgentStore } from '@/stores/agent-store';
import { fusionLocations } from '@/lib/brand-config';

/* ─── Inline tooltip (positions right for collapsed sidebar) ──────────────── */

function SidebarTooltip({ label, show, children }: { label: string; show: boolean; children: React.ReactNode }) {
  if (!show) return <>{children}</>;
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-fusion-primary-dark text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity shadow-lg">
        {label}
      </div>
    </div>
  );
}

/* ─── Nav config ──────────────────────────────────────────────────────────── */

const navItems = [
  { label: 'Overview',      href: '/overview',  icon: LayoutDashboard },
  { label: 'Real-Time',     href: '/realtime',  icon: Activity },
  { label: 'Sites',         href: '/sites',     icon: Building2, expandable: true },
  { label: 'Agent Actions', href: '/agent',     icon: Bot, showAlertDot: true },
  { label: 'Savings & ROI', href: '/savings',   icon: TrendingUp },
  { label: 'Settings',      href: '/settings',  icon: Settings, adminOnly: true },
];

const agentConfig = {
  active:   { color: 'bg-fusion-success', label: 'AI Agent Active' },
  paused:   { color: 'bg-fusion-warning', label: 'Paused' },
  learning: { color: 'bg-fusion-info',    label: 'Learning' },
  error:    { color: 'bg-fusion-danger',  label: 'Error' },
} as const;

/* ─── Component ───────────────────────────────────────────────────────────── */

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();
  const { status: agentStatus } = useAgentStore();
  const [sitesExpanded, setSitesExpanded] = useState(false);

  // Demo: unresolved critical alerts
  const unresolvedCritical = 2;

  const visibleItems = navItems.filter((item) =>
    !item.adminOnly || role === 'ADMIN',
  );

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  const roleBadge = role === 'ADMIN' ? 'Admin' : role === 'SITE_MANAGER' ? 'Site Manager' : 'Viewer';
  const config = agentConfig[agentStatus];
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        ${collapsed ? 'w-16' : 'w-[260px]'}
        bg-fusion-primary flex flex-col z-40
        transition-all duration-300 ease-in-out
        hidden lg:flex
      `}
    >
      {/* ── Logo ────────────────────────────────────────────────────────────── */}
      <div className={`py-5 ${collapsed ? 'px-2' : 'px-5'}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-[var(--fusion-radius)] bg-fusion-copper/20 flex items-center justify-center">
              <span className="text-fusion-copper font-bold text-sm">F</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-white tracking-wider">FUSION</span>
              <span className="text-base font-bold text-fusion-copper tracking-wider">STUDENTS</span>
            </div>
            <p className="text-[10px] text-fusion-copper tracking-[0.2em] uppercase mt-0.5">
              Energy Intelligence
            </p>
          </div>
        )}
      </div>

      {/* ── Copper separator ────────────────────────────────────────────────── */}
      <div className={`h-px bg-fusion-copper/30 mb-3 ${collapsed ? 'mx-2' : 'mx-5'}`} />

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          const linkContent = (
            <div
              className={`
                relative flex items-center gap-3 px-3 py-2.5
                rounded-[var(--fusion-radius)] text-sm transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-white/10 text-fusion-copper font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {/* Copper left border for active */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-border"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-fusion-copper"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Icon + optional alert dot */}
              <div className="relative flex-shrink-0">
                <Icon size={18} />
                {item.showAlertDot && unresolvedCritical > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-fusion-danger" />
                )}
              </div>

              {/* Label + expand toggle */}
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.expandable && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSitesExpanded(!sitesExpanded);
                      }}
                      className="p-0.5 hover:bg-white/10 rounded transition-colors"
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${sitesExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </>
              )}
            </div>
          );

          return (
            <div key={item.href}>
              <SidebarTooltip label={item.label} show={collapsed}>
                <Link href={item.href}>{linkContent}</Link>
              </SidebarTooltip>

              {/* Sites sub-menu */}
              {item.expandable && !collapsed && (
                <AnimatePresence>
                  {sitesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-5 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                        {fusionLocations.map((site) => {
                          const siteHref = `/sites/${site.id}`;
                          const isSiteActive = pathname === siteHref;
                          return (
                            <Link key={site.id} href={siteHref}>
                              <div
                                className={`
                                  flex items-center gap-2 px-2 py-1.5 rounded-[var(--fusion-radius-sm)] text-xs transition-colors
                                  ${isSiteActive
                                    ? 'text-fusion-copper bg-white/10'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                  }
                                `}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    site.status === 'operational' ? 'bg-fusion-success' : 'bg-fusion-warning'
                                  }`}
                                />
                                <span className="truncate">{site.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom section ──────────────────────────────────────────────────── */}
      <div className={`py-3 border-t border-white/10 space-y-1 ${collapsed ? 'px-1' : 'px-2'}`}>
        {/* Agent status */}
        <div className={`flex items-center gap-2 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <motion.div
            animate={agentStatus === 'active' || agentStatus === 'learning' ? { scale: [1, 1.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-2 h-2 rounded-full flex-shrink-0 ${config.color}`}
          />
          {!collapsed && <span className="text-xs text-white/70">{config.label}</span>}
        </div>

        {/* User info */}
        {session?.user && (
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-fusion-copper/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-medium text-fusion-copper">{userInitials}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{session.user.name}</p>
                <p className="text-[10px] text-fusion-copper">{roleBadge}</p>
              </div>
            )}
          </div>
        )}

        {/* Sign Out + Collapse toggle */}
        <div className="flex items-center">
          <SidebarTooltip label="Sign Out" show={collapsed}>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={`
                flex items-center gap-3 py-2 text-white/40 hover:text-white/70 transition-colors flex-1
                ${collapsed ? 'justify-center px-2' : 'px-3'}
              `}
            >
              <LogOut size={16} />
              {!collapsed && <span className="text-xs">Sign Out</span>}
            </button>
          </SidebarTooltip>

          <SidebarTooltip label={collapsed ? 'Expand' : 'Collapse'} show={collapsed}>
            <button
              onClick={toggleSidebar}
              className="p-2 text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </SidebarTooltip>
        </div>
      </div>
    </aside>
  );
}
