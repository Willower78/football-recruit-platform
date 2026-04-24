'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">
          Platform overview. Additional moderation tools land in a later step.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Users" value="—" />
          <StatCard title="Players" value="—" />
          <StatCard title="Clubs" value="—" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/search">Search</Link></Button>
            <Button asChild variant="outline">
              <a href="/api/docs" target="_blank" rel="noreferrer">API docs</a>
            </Button>
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
