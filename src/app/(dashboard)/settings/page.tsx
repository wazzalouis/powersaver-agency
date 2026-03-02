'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-helpers';
import { AccessDenied } from '@/components/auth/AccessDenied';

export default function SettingsPage() {
  const { isAdmin, isLoading } = useAuth();
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoReports, setAutoReports] = useState(true);

  if (isLoading) return null;
  if (!isAdmin) return <AccessDenied message="Only administrators can access platform settings." />;

  return (
    <div>
      <Header title="Settings" subtitle="Platform configuration" />

      <div className="space-y-4 max-w-2xl">
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">AI Agent</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fusion-text">Autonomous Mode</p>
                <p className="text-xs text-fusion-text-muted">Allow agent to execute actions automatically</p>
              </div>
              <Toggle checked={agentEnabled} onChange={setAgentEnabled} />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fusion-text">Email Alerts</p>
                <p className="text-xs text-fusion-text-muted">Receive critical alerts via email</p>
              </div>
              <Toggle checked={notifications} onChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fusion-text">Automated Reports</p>
                <p className="text-xs text-fusion-text-muted">Weekly energy summary sent to stakeholders</p>
              </div>
              <Toggle checked={autoReports} onChange={setAutoReports} />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">Data Export</h3>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">Export CSV</Button>
            <Button variant="secondary" size="sm">Generate PDF Report</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
