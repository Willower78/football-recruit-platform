'use client';

import Link from 'next/link';
import { Activity, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Admin dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Oversee users, verifications and audit activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total users" value="—" hint="Platform-wide" />
        <StatCard
          icon={ShieldCheck}
          label="Pending verifications"
          value="—"
          hint="Awaiting review"
        />
        <StatCard
          icon={Activity}
          label="Flagged content"
          value="0"
          hint="No reports"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shortcuts</CardTitle>
          <CardDescription>Jump into common admin tasks.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/admin/verification">
              Verification queue
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/users">User management</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/audit">Audit logs</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
