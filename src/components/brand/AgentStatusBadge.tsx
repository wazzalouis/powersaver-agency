'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useAgentStore } from '@/stores/agent-store';

export function AgentStatusBadge() {
  const { status } = useAgentStore();

  const statusConfig = {
    active:   { color: 'bg-fusion-success', label: 'Agent Active', pulse: true },
    paused:   { color: 'bg-fusion-warning', label: 'Agent Paused', pulse: false },
    learning: { color: 'bg-fusion-info', label: 'Agent Learning', pulse: true },
    error:    { color: 'bg-fusion-danger', label: 'Agent Error', pulse: false },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--fusion-radius)] bg-white/5">
      <Brain size={14} className="text-fusion-sage" />
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={config.pulse ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-1.5 h-1.5 rounded-full ${config.color}`}
        />
        <span className="text-xs text-white/70">{config.label}</span>
      </div>
    </div>
  );
}
