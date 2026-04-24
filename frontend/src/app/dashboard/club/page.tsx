'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface ClubProfile {
  id: string;
  clubName: string | null;
  country: string | null;
  city: string | null;
  competitionLevel: string | null;
  verified: boolean;
  verificationTier: string;
}

interface ClubNeed {
  id: string;
  position: string;
  ageMax: number | null;
  footPreference: string | null;
  heightMin: number | null;
  status: string;
}

interface SavedSearchItem {
  id: string;
  name: string;
  filters: Record<string, string>;
}

export default function ClubDashboard() {
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);

  useEffect(() => {
    api<ClubProfile>('/clubs/me').then(setProfile).catch(() => setProfile(null));
    api<SavedSearchItem[]>('/saved-searches').then(setSavedSearches).catch(() => {});
  }, []);

  return (
    <DashboardShell requireRole="club">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            {profile?.clubName ?? 'Your club'}
            {profile?.verified && <Badge variant="success">Verified</Badge>}
          </h1>
          <p className="text-muted-foreground">
            {profile?.city && profile.country ? `${profile.city}, ${profile.country}` : 'Set up your club profile to start recruiting.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Level" value={profile?.competitionLevel ?? '—'} />
          <StatCard title="Verification" value={profile?.verificationTier ?? 'unverified'} />
          <StatCard title="Active needs" value="0" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/search">Discover players</Link></Button>
            <Button asChild variant="outline"><Link href="/onboarding/club">Update profile</Link></Button>
            <Button asChild variant="outline">
              <Link href="/search?hasScoutingReport=true">Find Scouted Players</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {savedSearches.map((s) => {
                  const params = new URLSearchParams(s.filters as Record<string, string>);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/search?${params.toString()}`}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent"
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {Object.keys(s.filters).length} filters
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
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
