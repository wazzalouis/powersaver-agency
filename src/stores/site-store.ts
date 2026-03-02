import { create } from 'zustand';
import type { Site } from '@/types/site';

interface SiteState {
  sites: Site[];
  selectedSite: Site | null;
  setSites: (sites: Site[]) => void;
  setSelectedSite: (site: Site | null) => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  sites: [],
  selectedSite: null,
  setSites: (sites) => set({ sites }),
  setSelectedSite: (selectedSite) => set({ selectedSite }),
}));
