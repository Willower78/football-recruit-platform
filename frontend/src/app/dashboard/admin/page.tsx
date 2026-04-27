'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface Overview {
  totalUsers: number;
  totalPlayers: number;
  totalClubs: number;
  activeUsers: number;
  suspendedUsers: number;
  premiumUsers: number;
  freeUsers: number;
  roleBreakdown: { role: string; count: number }[];
}

interface RegistrationDay {
  date: string;
  count: number;
}

interface RecentUser {
  id: string;
  email: string;
  role: string;
  status: string;
  subscriptionPlan: string;
  createdAt: string;
  lastLoginAt: string | null;
}

function useAnalytics<T>(path: string) {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api<T>(path)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, path]);

  return { data, loading };
}

export default function OwnerDashboard() {
  const { data: overview, loading: loadingOverview } = useAnalytics<Overview>('/analytics/overview');
  const { data: registrations } = useAnalytics<RegistrationDay[]>('/analytics/registrations?days=30');
  const { data: recentUsers } = useAnalytics<RecentUser[]>('/analytics/users/recent?limit=10');

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Platform analytics and management overview.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={loadingOverview ? '...' : String(overview?.totalUsers ?? 0)}
          />
          <StatCard
            title="Players"
            value={loadingOverview ? '...' : String(overview?.totalPlayers ?? 0)}
          />
          <StatCard
            title="Clubs"
            value={loadingOverview ? '...' : String(overview?.totalClubs ?? 0)}
          />
          <StatCard
            title="Premium Users"
            value={loadingOverview ? '...' : String(overview?.premiumUsers ?? 0)}
          />
        </div>

        {/* Status breakdown */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Active"
            value={loadingOverview ? '...' : String(overview?.activeUsers ?? 0)}
            subtitle="Active accounts"
          />
          <StatCard
            title="Suspended"
            value={loadingOverview ? '...' : String(overview?.suspendedUsers ?? 0)}
            subtitle="Suspended accounts"
          />
          <StatCard
            title="Free Plan"
            value={loadingOverview ? '...' : String(overview?.freeUsers ?? 0)}
            subtitle="Free tier users"
          />
        </div>

        {/* Role breakdown */}
        {overview?.roleBreakdown && overview.roleBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                {overview.roleBreakdown.map((r) => (
                  <div key={r.role} className="text-center">
                    <p className="text-2xl font-semibold">{r.count}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {r.role}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration trend */}
        {registrations && registrations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Registrations (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-32">
                {registrations.map((day) => {
                  const max = Math.max(...registrations.map((d) => d.count), 1);
                  const height = (day.count / max) * 100;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 bg-secondary rounded-t transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${day.date}: ${day.count} registrations`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{registrations[0]?.date ? new Date(registrations[0].date).toLocaleDateString() : ''}</span>
                <span>{registrations[registrations.length - 1]?.date ? new Date(registrations[registrations.length - 1].date).toLocaleDateString() : ''}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent users */}
        {recentUsers && recentUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">Role</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Plan</th>
                      <th className="pb-2 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-2 font-mono text-xs">{u.email}</td>
                        <td className="py-2">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              u.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : u.status === 'suspended'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2 text-xs">{u.subscriptionPlan}</td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/search">Search</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/docs" target="_blank" rel="noreferrer">API Docs</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
