'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Overview {
  totalUsers: number;
  byRole: { player: number; club: number; scout: number; admin: number };
  newSignups: { last7Days: number; last30Days: number };
  activeUsers: { last7Days: number; last30Days: number };
  subscriptions: { free: number; premium: number; conversionRate: string };
  verifiedClubs: number;
  pendingVerifications: number;
  openReports: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    api<Overview>('/admin/analytics/overview').then(setData).catch(() => {});
  }, []);

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Users" value={data?.totalUsers?.toString() ?? '—'} />
          <StatCard title="Premium Users" value={data?.subscriptions?.premium?.toString() ?? '—'} />
          <StatCard title="Pending Verifications" value={data?.pendingVerifications?.toString() ?? '—'} />
          <StatCard title="Open Reports" value={data?.openReports?.toString() ?? '—'} />
          <StatCard title="Verified Clubs" value={data?.verifiedClubs?.toString() ?? '—'} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Users by Role</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data?.byRole ? (
                Object.entries(data.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="capitalize text-sm">{role}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Loading...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Signups</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Last 7 days</span>
                <span className="font-semibold">{data?.newSignups?.last7Days ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last 30 days</span>
                <span className="font-semibold">{data?.newSignups?.last30Days ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conversion rate</span>
                <span className="font-semibold">{data?.subscriptions?.conversionRate ?? '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/admin/verification">Review Verifications</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/reports">Moderate Reports</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/analytics">View Analytics</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/users">Manage Users</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/audit-logs">Audit Logs</Link></Button>
          </CardContent>
        </Card>
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
