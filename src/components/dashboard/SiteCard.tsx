'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Zap, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Site } from '@/types/site';

interface SiteCardProps {
  site: Site;
  metrics?: {
    consumptionKwh: number;
    costGbp: number;
    savingsPercent: number;
  };
}

export function SiteCard({ site, metrics }: SiteCardProps) {
  const statusVariant = site.status === 'operational' ? 'success' : site.status === 'maintenance' ? 'warning' : 'info';

  return (
    <Link href={`/sites/${site.id}`}>
      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Card padding="md" className="cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-fusion-text">{site.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-fusion-text-muted" />
                <span className="text-xs text-fusion-text-secondary">{site.city}</span>
              </div>
            </div>
            <Badge variant={statusVariant}>{site.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-fusion-sage" />
              <div>
                <p className="text-xs text-fusion-text-muted">Units</p>
                <p className="text-sm font-medium">{site.totalUnits}</p>
              </div>
            </div>
            {metrics && (
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-fusion-copper" />
                <div>
                  <p className="text-xs text-fusion-text-muted">Savings</p>
                  <p className="text-sm font-medium text-fusion-success">{metrics.savingsPercent}%</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
