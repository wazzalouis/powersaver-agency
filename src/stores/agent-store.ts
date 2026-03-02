import { create } from 'zustand';
import type { AgentStatus } from '@/types/agent';

interface AgentState {
  status: AgentStatus;
  isProcessing: boolean;
  setStatus: (status: AgentStatus) => void;
  setIsProcessing: (processing: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  status: 'active',
  isProcessing: false,
  setStatus: (status) => set({ status }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));
