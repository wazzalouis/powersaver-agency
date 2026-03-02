import { create } from 'zustand';
import type { TimeRange } from '@/types/energy';

interface DashboardState {
  timeRange: TimeRange;
  selectedSiteId: string | null;
  isLoading: boolean;
  sidebarCollapsed: boolean;
  notificationCount: number;
  setTimeRange: (range: TimeRange) => void;
  setSelectedSiteId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  timeRange: '7d',
  selectedSiteId: null,
  isLoading: false,
  sidebarCollapsed: false,
  notificationCount: 3,
  setTimeRange: (timeRange) => set({ timeRange }),
  setSelectedSiteId: (selectedSiteId) => set({ selectedSiteId }),
  setIsLoading: (isLoading) => set({ isLoading }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}));
