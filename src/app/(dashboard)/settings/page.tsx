'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Bell,
  Building2,
  ClipboardList,
  Save,
  Plus,
  X,
  Zap,
  Eye,
  Bot,
  Thermometer,
  Moon,
  Gauge,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { TimePicker } from '@/components/ui/TimePicker';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth-helpers';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { fetchJson } from '@/lib/formatters';
import type {
  SettingsData,
  AuditData,
  PlatformSettings,
  NotificationPreferences,
  SiteAgentConfig,
} from '@/types/settings';

// ── Autonomy level descriptions ─────────────────────────────────────────────

const AUTONOMY_LEVELS = [
  {
    level: 1,
    name: 'Notify Only',
    icon: Eye,
    description:
      'Agent identifies issues and creates alerts, but takes no corrective action. All responses require human intervention.',
    color: 'text-fusion-info',
    bg: 'bg-fusion-info/10',
  },
  {
    level: 2,
    name: 'Suggest',
    icon: Zap,
    description:
      'Agent detects issues, creates alerts, and proposes specific actions. Waits for human approval before executing.',
    color: 'text-fusion-warning',
    bg: 'bg-fusion-warning/10',
  },
  {
    level: 3,
    name: 'Auto-Act',
    icon: Bot,
    description:
      'Agent detects issues and acts autonomously within safety limits. All actions are logged for review.',
    color: 'text-fusion-success',
    bg: 'bg-fusion-success/10',
  },
];

// ── Feature toggle config ───────────────────────────────────────────────────

const FEATURE_TOGGLES: {
  key: keyof SiteAgentConfig;
  label: string;
  description: string;
}[] = [
  {
    key: 'hvacAutoSchedule',
    label: 'HVAC Auto-Schedule',
    description: 'Automatically adjust heating schedules based on occupancy',
  },
  {
    key: 'voidRoomDetection',
    label: 'Void Room Detection',
    description: 'Detect and reduce heating in unoccupied rooms',
  },
  {
    key: 'peakAvoidance',
    label: 'Peak Tariff Avoidance',
    description: 'Shift non-essential loads away from peak tariff windows',
  },
  {
    key: 'lightingAutomation',
    label: 'Lighting Automation',
    description: 'Auto-adjust corridor and communal area lighting',
  },
  {
    key: 'boilerOptimisation',
    label: 'Boiler Optimisation',
    description: 'Optimise boiler firing patterns and flow temperatures',
  },
  {
    key: 'waterHeatingOpt',
    label: 'Water Heating Optimisation',
    description: 'Schedule hot water heating for off-peak periods',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── Types ───────────────────────────────────────────────────────────────────

interface FormState {
  platform: PlatformSettings;
  notifications: NotificationPreferences;
  sites: SiteAgentConfig[];
}

interface ChangeItem {
  section: string;
  field: string;
  from: string;
  to: string;
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formState, setFormState] = useState<FormState | null>(null);
  const [originalState, setOriginalState] = useState<FormState | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [auditPage, setAuditPage] = useState(1);

  // Fetch settings
  const { data, isLoading } = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: () => fetchJson('/api/settings'),
    enabled: !!isAdmin,
  });

  // Fetch audit log
  const { data: auditData, isLoading: auditLoading } = useQuery<AuditData>({
    queryKey: ['audit-log', auditPage],
    queryFn: () => fetchJson(`/api/settings/audit-log?page=${auditPage}&limit=10`),
    enabled: !!isAdmin,
  });

  // Initialize form from API data
  useEffect(() => {
    if (data && !formState) {
      const initial: FormState = {
        platform: { ...data.platform },
        notifications: { ...data.notifications },
        sites: data.sites.map((s) => ({ ...s })),
      };
      setFormState(initial);
      setOriginalState(JSON.parse(JSON.stringify(initial)));
    }
  }, [data, formState]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (changes: ChangeItem[]) => {
      if (!formState || !originalState) return;

      const payload: Record<string, unknown> = {
        userId: user?.id ?? 'unknown',
        userName: user?.name ?? 'Admin',
      };

      // Only send changed sections
      if (!deepEqual(formState.platform, originalState.platform)) {
        payload.platform = formState.platform;
      }
      if (!deepEqual(formState.notifications, originalState.notifications)) {
        payload.notifications = formState.notifications;
      }

      const changedSites = formState.sites.filter((site, i) => {
        return !deepEqual(site, originalState.sites[i]);
      });
      if (changedSites.length > 0) {
        payload.sites = changedSites;
      }

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: () => {
      setShowConfirmModal(false);
      setOriginalState(JSON.parse(JSON.stringify(formState)));
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['audit-log'] });
    },
  });

  // Compute changes for confirmation modal
  const computeChanges = useCallback((): ChangeItem[] => {
    if (!formState || !originalState) return [];
    const changes: ChangeItem[] = [];

    // Platform changes
    if (formState.platform.agentActive !== originalState.platform.agentActive) {
      changes.push({
        section: 'Global',
        field: 'AI Agent Active',
        from: originalState.platform.agentActive ? 'ON' : 'OFF',
        to: formState.platform.agentActive ? 'ON' : 'OFF',
      });
    }
    if (
      formState.platform.globalAutonomy !==
      originalState.platform.globalAutonomy
    ) {
      const getLabel = (v: number) =>
        AUTONOMY_LEVELS.find((l) => l.level === v)?.name ?? String(v);
      changes.push({
        section: 'Global',
        field: 'Autonomy Level',
        from: getLabel(originalState.platform.globalAutonomy),
        to: getLabel(formState.platform.globalAutonomy),
      });
    }

    // Notification changes
    const nf = formState.notifications;
    const no = originalState.notifications;
    if (nf.alertLevel !== no.alertLevel) {
      changes.push({
        section: 'Notifications',
        field: 'Alert Level',
        from: no.alertLevel,
        to: nf.alertLevel,
      });
    }
    if (JSON.stringify(nf.recipientEmails) !== JSON.stringify(no.recipientEmails)) {
      changes.push({
        section: 'Notifications',
        field: 'Recipients',
        from: no.recipientEmails.join(', '),
        to: nf.recipientEmails.join(', '),
      });
    }
    if (nf.dailyDigest !== no.dailyDigest) {
      changes.push({
        section: 'Notifications',
        field: 'Daily Digest',
        from: no.dailyDigest ? 'ON' : 'OFF',
        to: nf.dailyDigest ? 'ON' : 'OFF',
      });
    }
    if (nf.dailyDigestTime !== no.dailyDigestTime) {
      changes.push({
        section: 'Notifications',
        field: 'Digest Time',
        from: no.dailyDigestTime,
        to: nf.dailyDigestTime,
      });
    }
    if (nf.weeklyReport !== no.weeklyReport) {
      changes.push({
        section: 'Notifications',
        field: 'Weekly Report',
        from: no.weeklyReport ? 'ON' : 'OFF',
        to: nf.weeklyReport ? 'ON' : 'OFF',
      });
    }
    if (nf.weeklyReportDay !== no.weeklyReportDay) {
      changes.push({
        section: 'Notifications',
        field: 'Report Day',
        from: no.weeklyReportDay,
        to: nf.weeklyReportDay,
      });
    }

    // Site changes
    formState.sites.forEach((site, i) => {
      const orig = originalState.sites[i];
      if (!orig) return;
      for (const ft of FEATURE_TOGGLES) {
        const key = ft.key;
        if (site[key] !== orig[key]) {
          changes.push({
            section: site.siteName,
            field: ft.label,
            from: orig[key] ? 'ON' : 'OFF',
            to: site[key] ? 'ON' : 'OFF',
          });
        }
      }
      if (site.hvacMinTemp !== orig.hvacMinTemp) {
        changes.push({
          section: site.siteName,
          field: 'HVAC Min Temp',
          from: `${orig.hvacMinTemp}°C`,
          to: `${site.hvacMinTemp}°C`,
        });
      }
      if (site.hvacMaxTemp !== orig.hvacMaxTemp) {
        changes.push({
          section: site.siteName,
          field: 'HVAC Max Temp',
          from: `${orig.hvacMaxTemp}°C`,
          to: `${site.hvacMaxTemp}°C`,
        });
      }
      if (site.nightModeStart !== orig.nightModeStart) {
        changes.push({
          section: site.siteName,
          field: 'Night Mode Start',
          from: orig.nightModeStart,
          to: site.nightModeStart,
        });
      }
      if (site.nightModeEnd !== orig.nightModeEnd) {
        changes.push({
          section: site.siteName,
          field: 'Night Mode End',
          from: orig.nightModeEnd,
          to: site.nightModeEnd,
        });
      }
      if (site.peakTariffThreshold !== orig.peakTariffThreshold) {
        changes.push({
          section: site.siteName,
          field: 'Peak Tariff Threshold',
          from: `${orig.peakTariffThreshold}p/kWh`,
          to: `${site.peakTariffThreshold}p/kWh`,
        });
      }
    });

    return changes;
  }, [formState, originalState]);

  const hasChanges = formState && originalState && !deepEqual(formState, originalState);
  const changes = hasChanges ? computeChanges() : [];

  // ── Update helpers ──────────────────────────────────────────────────────

  function updatePlatform(updates: Partial<PlatformSettings>) {
    if (!formState) return;
    setFormState({
      ...formState,
      platform: { ...formState.platform, ...updates },
    });
  }

  function updateNotifications(updates: Partial<NotificationPreferences>) {
    if (!formState) return;
    setFormState({
      ...formState,
      notifications: { ...formState.notifications, ...updates },
    });
  }

  function updateSite(siteId: string, updates: Partial<SiteAgentConfig>) {
    if (!formState) return;
    setFormState({
      ...formState,
      sites: formState.sites.map((s) =>
        s.siteId === siteId ? { ...s, ...updates } : s,
      ),
    });
  }

  function addEmail() {
    if (!formState || !newEmail.trim()) return;
    const email = newEmail.trim().toLowerCase();
    if (formState.notifications.recipientEmails.includes(email)) return;
    updateNotifications({
      recipientEmails: [...formState.notifications.recipientEmails, email],
    });
    setNewEmail('');
  }

  function removeEmail(email: string) {
    if (!formState) return;
    updateNotifications({
      recipientEmails: formState.notifications.recipientEmails.filter(
        (e) => e !== email,
      ),
    });
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (authLoading) return null;
  if (!isAdmin)
    return (
      <AccessDenied message="Only administrators can access platform settings." />
    );

  if (isLoading || !formState) return <SettingsSkeleton />;

  const activeLevel = AUTONOMY_LEVELS.find(
    (l) => l.level === formState.platform.globalAutonomy,
  );

  return (
    <div className="pb-12">
      {/* Header + Save bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Settings size={22} className="text-fusion-primary" />
            <h1 className="text-2xl font-display text-fusion-text">Settings</h1>
          </div>
          <p className="text-sm text-fusion-text-secondary mt-0.5 ml-[34px]">
            Platform configuration and agent controls
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={!hasChanges || saveMutation.isPending}
          isLoading={saveMutation.isPending}
          leftIcon={<Save size={14} />}
          onClick={() => setShowConfirmModal(true)}
        >
          Save Changes{changes.length > 0 && ` (${changes.length})`}
        </Button>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* ── Section 1: Global Agent Controls ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-fusion-primary" />
                <span className="text-sm font-medium text-fusion-text">
                  Global Agent Controls
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Master toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-fusion-text">
                    AI Agent Active
                  </p>
                  <p className="text-xs text-fusion-text-muted mt-0.5">
                    Master switch — disabling pauses all AI actions across the
                    portfolio
                  </p>
                </div>
                <Toggle
                  checked={formState.platform.agentActive}
                  onChange={(v) => updatePlatform({ agentActive: v })}
                />
              </div>

              {/* Autonomy slider */}
              <div>
                <Slider
                  min={1}
                  max={3}
                  step={1}
                  value={formState.platform.globalAutonomy}
                  onChange={(v) => updatePlatform({ globalAutonomy: v })}
                  label="Autonomy Level"
                  valueLabel={(v) =>
                    AUTONOMY_LEVELS.find((l) => l.level === v)?.name ?? ''
                  }
                  disabled={!formState.platform.agentActive}
                />

                {/* Level descriptions */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {AUTONOMY_LEVELS.map((level) => {
                    const Icon = level.icon;
                    const isActive =
                      level.level === formState.platform.globalAutonomy;
                    return (
                      <div
                        key={level.level}
                        className={`
                          rounded-[var(--fusion-radius)] p-3 border transition-all
                          ${
                            isActive
                              ? `${level.bg} border-current ${level.color}`
                              : 'border-fusion-cream-dark/20 bg-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            size={14}
                            className={isActive ? level.color : 'text-fusion-text-muted'}
                          />
                          <span
                            className={`text-xs font-medium ${
                              isActive ? level.color : 'text-fusion-text-muted'
                            }`}
                          >
                            Level {level.level}: {level.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-fusion-text-secondary leading-relaxed">
                          {level.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Section 2: Per-Site Configuration ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-fusion-primary" />
                <span className="text-sm font-medium text-fusion-text">
                  Per-Site Configuration
                </span>
              </div>
            }
          >
            <Accordion>
              {formState.sites.map((site, idx) => {
                const enabledCount = FEATURE_TOGGLES.filter(
                  (ft) => site[ft.key] as boolean,
                ).length;
                return (
                  <AccordionItem
                    key={site.siteId}
                    defaultOpen={idx === 0}
                    title={site.siteName}
                    subtitle={site.siteSlug}
                    badge={
                      <Badge
                        variant={
                          enabledCount >= 5
                            ? 'success'
                            : enabledCount >= 3
                              ? 'warning'
                              : 'danger'
                        }
                        size="sm"
                      >
                        {enabledCount}/{FEATURE_TOGGLES.length} active
                      </Badge>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Feature toggles */}
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                          Capabilities
                        </p>
                        {FEATURE_TOGGLES.map((ft) => (
                          <div
                            key={ft.key}
                            className="flex items-center justify-between py-1"
                          >
                            <div>
                              <p className="text-sm text-fusion-text">
                                {ft.label}
                              </p>
                              <p className="text-[11px] text-fusion-text-muted">
                                {ft.description}
                              </p>
                            </div>
                            <Toggle
                              checked={site[ft.key] as boolean}
                              onChange={(v) =>
                                updateSite(site.siteId, { [ft.key]: v })
                              }
                              disabled={!formState.platform.agentActive}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Right: Parameter controls */}
                      <div className="space-y-5">
                        {/* HVAC Temperature Range */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <Thermometer
                              size={13}
                              className="text-fusion-text-muted"
                            />
                            <p className="text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                              HVAC Temperature Range
                            </p>
                          </div>
                          <div className="space-y-3">
                            <Slider
                              min={16}
                              max={20}
                              step={0.5}
                              value={site.hvacMinTemp}
                              onChange={(v) =>
                                updateSite(site.siteId, { hvacMinTemp: v })
                              }
                              label="Minimum"
                              valueLabel={(v) => `${v}°C`}
                              disabled={!formState.platform.agentActive}
                            />
                            <Slider
                              min={20}
                              max={24}
                              step={0.5}
                              value={site.hvacMaxTemp}
                              onChange={(v) =>
                                updateSite(site.siteId, { hvacMaxTemp: v })
                              }
                              label="Maximum"
                              valueLabel={(v) => `${v}°C`}
                              disabled={!formState.platform.agentActive}
                            />
                          </div>
                        </div>

                        {/* Night Mode Schedule */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <Moon
                              size={13}
                              className="text-fusion-text-muted"
                            />
                            <p className="text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                              Night Mode Schedule
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <TimePicker
                              value={site.nightModeStart}
                              onChange={(v) =>
                                updateSite(site.siteId, {
                                  nightModeStart: v,
                                })
                              }
                              label="Start"
                              disabled={!formState.platform.agentActive}
                            />
                            <TimePicker
                              value={site.nightModeEnd}
                              onChange={(v) =>
                                updateSite(site.siteId, { nightModeEnd: v })
                              }
                              label="End"
                              disabled={!formState.platform.agentActive}
                            />
                          </div>
                        </div>

                        {/* Peak Tariff Threshold */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <Gauge
                              size={13}
                              className="text-fusion-text-muted"
                            />
                            <p className="text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                              Peak Tariff Threshold
                            </p>
                          </div>
                          <Slider
                            min={0.1}
                            max={0.6}
                            step={0.01}
                            value={site.peakTariffThreshold}
                            onChange={(v) =>
                              updateSite(site.siteId, {
                                peakTariffThreshold:
                                  Math.round(v * 100) / 100,
                              })
                            }
                            label="Trigger point"
                            valueLabel={(v) => `${(v * 100).toFixed(0)}p/kWh`}
                            disabled={!formState.platform.agentActive}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        </motion.div>

        {/* ── Section 3: Notification Preferences ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-fusion-primary" />
                <span className="text-sm font-medium text-fusion-text">
                  Notification Preferences
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Alert level */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-fusion-text">Email alerts for</p>
                  <p className="text-xs text-fusion-text-muted mt-0.5">
                    Which severity levels trigger email notifications
                  </p>
                </div>
                <div className="w-48">
                  <Select
                    value={formState.notifications.alertLevel}
                    onChange={(e) =>
                      updateNotifications({
                        alertLevel: e.target
                          .value as NotificationPreferences['alertLevel'],
                      })
                    }
                    options={[
                      { value: 'CRITICAL', label: 'Critical only' },
                      {
                        value: 'CRITICAL_WARNING',
                        label: 'Critical + Warning',
                      },
                      { value: 'ALL', label: 'All alerts' },
                    ]}
                  />
                </div>
              </div>

              {/* Recipient emails */}
              <div>
                <p className="text-sm text-fusion-text mb-2">
                  Recipient email addresses
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formState.notifications.recipientEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fusion-cream text-sm text-fusion-text"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="text-fusion-text-muted hover:text-fusion-danger transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                    placeholder="Add email address..."
                    className="flex-1 bg-white border border-fusion-cream-dark/30 rounded-[var(--fusion-radius)] px-3 py-2 text-sm text-fusion-text placeholder:text-fusion-text-muted focus:outline-none focus:ring-2 focus:ring-fusion-sage focus:border-transparent"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={addEmail}
                    leftIcon={<Plus size={14} />}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Daily digest */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-fusion-text">Daily digest</p>
                    <p className="text-xs text-fusion-text-muted mt-0.5">
                      Receive a daily summary of all agent activity
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28">
                    <TimePicker
                      value={formState.notifications.dailyDigestTime}
                      onChange={(v) =>
                        updateNotifications({ dailyDigestTime: v })
                      }
                      disabled={!formState.notifications.dailyDigest}
                    />
                  </div>
                  <Toggle
                    checked={formState.notifications.dailyDigest}
                    onChange={(v) => updateNotifications({ dailyDigest: v })}
                  />
                </div>
              </div>

              {/* Weekly report */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-fusion-text">Weekly report</p>
                  <p className="text-xs text-fusion-text-muted mt-0.5">
                    Comprehensive weekly energy and savings report
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <Select
                      value={formState.notifications.weeklyReportDay}
                      onChange={(e) =>
                        updateNotifications({ weeklyReportDay: e.target.value })
                      }
                      options={[
                        { value: 'MONDAY', label: 'Monday' },
                        { value: 'TUESDAY', label: 'Tuesday' },
                        { value: 'WEDNESDAY', label: 'Wednesday' },
                        { value: 'THURSDAY', label: 'Thursday' },
                        { value: 'FRIDAY', label: 'Friday' },
                        { value: 'SATURDAY', label: 'Saturday' },
                        { value: 'SUNDAY', label: 'Sunday' },
                      ]}
                      disabled={!formState.notifications.weeklyReport}
                    />
                  </div>
                  <Toggle
                    checked={formState.notifications.weeklyReport}
                    onChange={(v) => updateNotifications({ weeklyReport: v })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Section 4: Audit Log ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-fusion-primary" />
                <span className="text-sm font-medium text-fusion-text">
                  Audit Log
                </span>
                {auditData && (
                  <Badge variant="neutral" size="sm">
                    {auditData.pagination.total} entries
                  </Badge>
                )}
              </div>
            }
          >
            {auditLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height="40px" />
                ))}
              </div>
            ) : !auditData?.entries.length ? (
              <p className="text-sm text-fusion-text-muted text-center py-8">
                No configuration changes recorded yet.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-fusion-cream-dark/30">
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                          Timestamp
                        </th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                          User
                        </th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                          Change
                        </th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                          Previous
                        </th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-fusion-text-muted uppercase tracking-wide">
                          New Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditData.entries.map((entry, i) => (
                        <tr
                          key={entry.id}
                          className={`border-b border-fusion-cream-dark/15 ${
                            i % 2 === 0 ? 'bg-white' : 'bg-fusion-cream-light/30'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-xs text-fusion-text-secondary font-data whitespace-nowrap">
                            {formatDate(entry.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-fusion-text">
                            {entry.userName}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-fusion-text">
                            {entry.action}
                            {entry.entityId && (
                              <span className="text-fusion-text-muted ml-1">
                                ({entry.entityId})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-xs font-data text-fusion-danger">
                            {entry.previousValue}
                          </td>
                          <td className="py-2.5 px-3 text-xs font-data text-fusion-success">
                            {entry.newValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {auditData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-fusion-cream-dark/20">
                    <span className="text-xs text-fusion-text-muted">
                      Page {auditData.pagination.page} of{' '}
                      {auditData.pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={auditData.pagination.page <= 1}
                        onClick={() =>
                          setAuditPage((p) => Math.max(1, p - 1))
                        }
                        leftIcon={<ChevronLeft size={14} />}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                          auditData.pagination.page >=
                          auditData.pagination.totalPages
                        }
                        onClick={() => setAuditPage((p) => p + 1)}
                        rightIcon={<ChevronRight size={14} />}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </div>

      {/* ── Confirmation Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Changes"
      >
        <div className="space-y-4">
          <p className="text-sm text-fusion-text-secondary">
            You are about to save {changes.length} configuration{' '}
            {changes.length === 1 ? 'change' : 'changes'}:
          </p>

          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {changes.map((change, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs py-1.5 px-2 rounded bg-fusion-cream-light/50"
              >
                <Badge variant="neutral" size="sm">
                  {change.section}
                </Badge>
                <span className="text-fusion-text">{change.field}:</span>
                <span className="font-data text-fusion-danger line-through">
                  {change.from}
                </span>
                <span className="text-fusion-text-muted">&rarr;</span>
                <span className="font-data text-fusion-success">
                  {change.to}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={saveMutation.isPending}
              onClick={() => saveMutation.mutate(changes)}
              leftIcon={<Save size={14} />}
            >
              Confirm &amp; Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton width="200px" height="28px" />
          <Skeleton width="260px" height="16px" className="mt-2" />
        </div>
        <Skeleton width="120px" height="36px" />
      </div>
      <div className="space-y-6 max-w-4xl">
        <Skeleton height="240px" />
        <Skeleton height="120px" />
        <Skeleton height="200px" />
        <Skeleton height="300px" />
      </div>
    </div>
  );
}
