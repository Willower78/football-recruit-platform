'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Overview {
  totalUsers: number;
  byRole: Record<string, number>;
  newSignups: { last7Days: number; last30Days: number };
  activeUsers: { last7Days: number; last30Days: number };
  subscriptions: { free: number; premium: number; conversionRate: string };
  verifiedClubs: number;
  pendingVerifications: number;
  openReports: number;
}

interface SignupData {
  date: string;
  count: number;
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [signups, setSignups] = useState<SignupData[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api<Overview>('/admin/analytics/overview').then(setOverview).catch(() => {});
  }, []);

  useEffect(() => {
    api<SignupData[]>(`/admin/analytics/signups?days=${days}`).then(setSignups).catch(() => {});
  }, [days]);

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Platform Analytics</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Users" value={overview?.totalUsers?.toString() ?? '—'} />
          <StatCard title="Premium %" value={overview?.subscriptions?.conversionRate ?? '—'} />
          <StatCard title="Verified Clubs" value={overview?.verifiedClubs?.toString() ?? '—'} />
          <StatCard title="Active (7d)" value={overview?.activeUsers?.last7Days?.toString() ?? '—'} />
          <StatCard title="Open Reports" value={overview?.openReports?.toString() ?? '—'} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Signups</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={days === 30 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDays(30)}
                  >
                    30d
                  </Button>
                  <Button
                    variant={days === 90 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDays(90)}
                  >
                    90d
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {signups.length === 0 ? (
                <p className="text-muted-foreground text-sm">No signup data available.</p>
              ) : (
                <div className="space-y-1">
                  {signups.slice(-14).map((s) => (
                    <div key={s.date} className="flex items-center gap-3 text-sm">
                      <span className="w-24 text-muted-foreground">{s.date}</span>
                      <div
                        className="h-4 rounded bg-primary"
                        style={{ width: `${Math.max(4, s.count * 20)}px` }}
                      />
                      <span className="font-medium">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Users by Role</CardTitle></CardHeader>
            <CardContent>
              {overview?.byRole ? (
                <div className="space-y-3">
                  {Object.entries(overview.byRole).map(([role, count]) => {
                    const pct = overview.totalUsers > 0 ? (count / overview.totalUsers) * 100 : 0;
                    return (
                      <div key={role} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{role}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Loading...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Subscriptions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Free users</span>
                <span className="font-semibold">{overview?.subscriptions?.free ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Premium users</span>
                <span className="font-semibold">{overview?.subscriptions?.premium ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Conversion rate</span>
                <span className="font-semibold">{overview?.subscriptions?.conversionRate ?? '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Platform Health</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Pending verifications</span>
                <span className="font-semibold">{overview?.pendingVerifications ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Open reports</span>
                <span className="font-semibold">{overview?.openReports ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>New signups (30d)</span>
                <span className="font-semibold">{overview?.newSignups?.last30Days ?? '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
