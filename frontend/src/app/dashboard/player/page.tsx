'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface PlayerProfile {
  id: string;
  fullName: string | null;
  primaryPosition: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  currentClub: string | null;
  freeAgent: boolean;
  availabilityStatus: string;
}

function completion(p: PlayerProfile | null): number {
  if (!p) return 0;
  const fields = [p.fullName, p.primaryPosition, p.city, p.country, p.bio, p.currentClub];
  const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export default function PlayerDashboard() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<PlayerProfile>('/players/me')
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell requireRole="player">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}</h1>
          <p className="text-muted-foreground">Your player dashboard.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-2 w-full" />
            ) : (
              <>
                <Progress value={completion(profile)} />
                <p className="text-sm text-muted-foreground">
                  {completion(profile)}% complete. Fuller profiles get seen by more clubs.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/onboarding/player">Edit profile</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Position" value={profile?.primaryPosition ?? '—'} />
          <StatCard title="Club" value={profile?.currentClub || (profile?.freeAgent ? 'Free agent' : '—')} />
          <StatCard title="Availability" value={(profile?.availabilityStatus ?? 'available').replace('_', ' ')} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/tryouts">Discover tryouts</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/player/applications">My applications</Link></Button>
            <Button asChild variant="outline"><Link href="/search">Discover clubs</Link></Button>
            <Button asChild variant="outline"><Link href="/onboarding/player">Update profile</Link></Button>
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
        <p className="text-2xl font-semibold capitalize">{value}</p>
      </CardContent>
    </Card>
  );
}
