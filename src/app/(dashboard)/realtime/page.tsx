'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, Wifi } from 'lucide-react';

export default function RealtimePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">Real-time Monitoring</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">Live energy data across all Fusion sites</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Badge variant="success">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-fusion-success animate-pulse" />
            Live
          </span>
        </Badge>
        <span className="text-xs text-fusion-text-muted">Updating every 15 seconds</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-fusion-primary" />
            <h3 className="text-sm font-medium text-fusion-text">Live Demand</h3>
          </div>
          <div className="h-[350px] flex items-center justify-center text-fusion-text-muted text-sm">
            Real-time demand chart — WebSocket feed will be integrated
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Wifi size={16} className="text-fusion-primary" />
            <h3 className="text-sm font-medium text-fusion-text">Site Status</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Brent Cross Town', kw: 187 },
              { name: 'Liverpool', kw: 142 },
              { name: 'Nottingham', kw: 198 },
              { name: 'York', kw: 115 },
            ].map((site) => (
              <div key={site.name} className="flex items-center justify-between p-3 rounded-[var(--fusion-radius)] bg-fusion-cream-light">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fusion-success" />
                  <span className="text-sm text-fusion-text">{site.name}</span>
                </div>
                <span className="text-sm font-mono text-fusion-text-secondary">
                  {site.kw} kW
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
