'use client';

import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AgentActionLog } from '@/components/dashboard/AgentActionLog';
import { Brain, CheckCircle, Zap, Target } from 'lucide-react';
import { generateAgentAction } from '@/lib/agent-logic';

const demoActions = Array.from({ length: 8 }, (_, i) => {
  const siteIds = ['brent-cross', 'liverpool', 'nottingham', 'york'];
  const date = new Date();
  date.setHours(date.getHours() - i * 3);
  return generateAgentAction(siteIds[i % siteIds.length], date);
});

export default function AgentPage() {
  return (
    <div>
      <Header title="AI Agent" subtitle="Autonomous energy management decisions" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Actions" value={142} subtext="Last 30 days" icon={<Brain size={20} className="text-fusion-primary" />} />
        <MetricCard label="Total Savings" value="£34,200" subtext="Automated savings" icon={<Zap size={20} className="text-fusion-sage" />} accent />
        <MetricCard label="Automation Rate" value="78%" subtext="Actions auto-executed" icon={<CheckCircle size={20} className="text-fusion-success" />} />
        <MetricCard label="Avg Confidence" value="92%" subtext="Decision accuracy" icon={<Target size={20} className="text-fusion-copper" />} />
      </div>

      <Card padding="md">
        <h3 className="text-sm font-medium text-fusion-text mb-4">Recent Agent Actions</h3>
        <AgentActionLog actions={demoActions} />
      </Card>
    </div>
  );
}
