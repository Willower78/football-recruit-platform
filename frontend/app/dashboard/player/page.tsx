'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ClipboardList,
  Eye,
  Upload,
  Video,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PlayerProfile {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  city: string | null;
  country: string | null;
  primary_position: string | null;
  dominant_foot: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  current_club: string | null;
  availability_status: string | null;
  bio: string | null;
}

const PROFILE_FIELDS: Array<keyof PlayerProfile> = [
  'full_name',
  'date_of_birth',
  'nationality',
  'city',
  'country',
  'primary_position',
  'dominant_foot',
  'height_cm',
  'weight_kg',
  'current_club',
  'availability_status',
  'bio',
];

export default function PlayerDashboardPage() {
  const { accessToken, user } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    api<PlayerProfile>('/players/me', { token: accessToken })
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [accessToken]);

  const completion = profile
    ? Math.round(
        (PROFILE_FIELDS.filter(
          (f) =>
            profile[f] !== null && profile[f] !== '' && profile[f] !== undefined,
        ).length /
          PROFILE_FIELDS.length) *
          100,
      )
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {profile?.full_name ?? user?.email ?? 'player'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s the state of your profile today.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile completeness</CardTitle>
          <CardDescription>
            A complete profile gets shown to more clubs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={completion} />
          <p className="text-sm text-muted-foreground">{completion}% complete</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Profile views"
          value="—"
          hint="Coming soon"
        />
        <StatCard
          icon={Video}
          label="Videos uploaded"
          value="0"
          hint="Upload highlights"
        />
        <StatCard
          icon={ClipboardList}
          label="Recommendations"
          value="0"
          hint="Request from coaches"
        />
        <StatCard
          icon={Activity}
          label="Assessment"
          value="Not started"
          hint="Take in 10 minutes"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/player/videos">
              <Upload className="mr-2 h-4 w-4" /> Upload video
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/player/assessment">
              <Activity className="mr-2 h-4 w-4" /> Take assessment
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/player/recommendations">
              <ClipboardList className="mr-2 h-4 w-4" /> Request recommendation
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
  icon: typeof Eye;
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
