'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Ruler, Leaf, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EfficiencyGauge } from '@/components/charts/EfficiencyGauge';
import { useAuth } from '@/lib/auth-helpers';
import { formatCurrency, formatCo2, formatNumber, fetchJson } from '@/lib/formatters';

interface SiteListItem {
  slug: string;
  name: string;
  city: string;
  rooms: number;
  totalSqm: number;
  monthlyCost: number;
  monthlySavings: number;
  efficiency: number;
  co2SavedKg: number;
  costPerBedPerWeek: number;
}

function SiteCardSkeleton() {
  return (
    <Card padding="md">
      <Skeleton className="h-5 w-36 mb-1" />
      <Skeleton className="h-3 w-20 mb-4" />
      <div className="flex justify-center mb-4">
        <Skeleton className="h-20 w-32 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </Card>
  );
}

export default function SitesPage() {
  const { isSiteManager, siteSlugs } = useAuth();

  const { data, isLoading } = useQuery<{ sites: SiteListItem[] }>({
    queryKey: ['sites-list'],
    queryFn: () => fetchJson('/api/sites/list'),
  });

  const sites = data?.sites?.filter(
    (s) => !isSiteManager || siteSlugs.includes(s.slug),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">Sites</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">
          {isSiteManager ? 'Your assigned properties' : 'All Fusion Students properties'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SiteCardSkeleton key={i} />
          ))}
        </div>
      ) : sites?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <Link key={site.slug} href={`/sites/${site.slug}`}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Card padding="md" className="cursor-pointer group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold font-body text-fusion-text text-lg">{site.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-fusion-text-muted" />
                        <span className="text-xs text-fusion-text-secondary">{site.city}</span>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-fusion-text-muted group-hover:text-fusion-primary transition-colors mt-1"
                    />
                  </div>

                  {/* Room count + sqm */}
                  <div className="flex items-center gap-4 text-xs text-fusion-text-secondary mt-2 mb-3">
                    <span className="flex items-center gap-1">
                      <BedDouble size={12} />
                      {formatNumber(site.rooms)} rooms
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler size={12} />
                      {formatNumber(site.totalSqm)} sqm
                    </span>
                  </div>

                  {/* Efficiency gauge */}
                  <div className="flex justify-center mb-3">
                    <EfficiencyGauge value={site.efficiency} size={130} label="Efficiency" />
                  </div>

                  {/* Cost + savings row */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-fusion-cream-light/50 rounded-lg p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-fusion-text-muted mb-0.5">
                        Monthly Cost
                      </p>
                      <p className="text-sm font-semibold text-fusion-text">
                        {formatCurrency(site.monthlyCost, 0)}
                      </p>
                    </div>
                    <div className="bg-fusion-cream-light/50 rounded-lg p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-fusion-text-muted mb-0.5">
                        AI Savings
                      </p>
                      <p className="text-sm font-semibold text-fusion-success">
                        {formatCurrency(site.monthlySavings, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Bottom stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-fusion-cream-dark/30">
                    <div className="flex items-center gap-1 text-xs text-fusion-text-secondary">
                      <Leaf size={12} className="text-fusion-success" />
                      {formatCo2(site.co2SavedKg)} saved
                    </div>
                    <Badge variant="neutral" size="sm">
                      {formatCurrency(site.costPerBedPerWeek)}/bed/wk
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-fusion-text-muted py-8 text-center">No site data available</p>
      )}
    </div>
  );
}
