import { create } from 'zustand';
import type { TimeRange } from '@/types/energy';

interface DashboardState {
  timeRange: TimeRange;
  selectedSiteId: string | null;
  isLoading: boolean;
  setTimeRange: (range: TimeRange) => void;
  setSelectedSiteId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  timeRange: '7d',
  selectedSiteId: null,
  isLoading: false,
  setTimeRange: (timeRange) => set({ timeRange }),
  setSelectedSiteId: (selectedSiteId) => set({ selectedSiteId }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
