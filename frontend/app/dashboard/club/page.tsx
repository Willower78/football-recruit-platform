'use client';

import Link from 'next/link';
import { ClipboardList, Plus, Search, Users } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ClubDashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {user?.email ?? 'Club'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Recruitment pipeline and stats overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ClipboardList}
          label="Active needs"
          value="0"
          hint="Post new recruitment need"
        />
        <StatCard
          icon={Users}
          label="Shortlisted players"
          value="0"
          hint="Create your first shortlist"
        />
        <StatCard
          icon={Users}
          label="Applications received"
          value="0"
          hint="No applicants yet"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick actions</CardTitle>
          <CardDescription>
            Common things clubs do on this platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/club/needs/new">
              <Plus className="mr-2 h-4 w-4" /> Post recruitment need
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" /> Search players
            </Link>
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
