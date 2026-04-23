'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BadgeCheck, ClipboardList, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { PublicHeader } from '@/components/public-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ClubProfile {
  id: string;
  club_name: string;
  country: string | null;
  city: string | null;
  league_name: string | null;
  competition_level: string | null;
  age_groups: string[];
  verified: boolean;
  verification_tier: 'unverified' | 'pending' | 'verified' | 'official';
  description: string | null;
  website_url: string | null;
}

export default function ClubProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<ClubProfile>(`/clubs/${id}`)
      .then(setClub)
      .catch(() => setError('Club not found.'));
  }, [id]);

  const tierColor: Record<ClubProfile['verification_tier'], string> = {
    unverified: 'text-slate-400',
    pending: 'text-amber-500',
    verified: 'text-sky-500',
    official: 'text-amber-400',
  };
  const tierLabel: Record<ClubProfile['verification_tier'], string> = {
    unverified: 'Unverified',
    pending: 'Verification pending',
    verified: 'Verified',
    official: 'Official club',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle>Not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : !club ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold">{club.club_name}</h1>
                    <BadgeCheck className={`h-5 w-5 ${tierColor[club.verification_tier]}`} />
                    <span className="text-xs text-muted-foreground">
                      {tierLabel[club.verification_tier]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[club.city, club.country].filter(Boolean).join(', ') ||
                      'Location unknown'}
                  </p>
                  {club.age_groups && club.age_groups.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {club.age_groups.map((ag) => (
                        <Badge key={ag} variant="secondary">
                          {ag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                <Info label="Country" value={club.country ?? '—'} />
                <Info label="City" value={club.city ?? '—'} />
                <Info label="League" value={club.league_name ?? '—'} />
                <Info
                  label="Competition level"
                  value={club.competition_level ?? '—'}
                />
                <Info
                  label="Description"
                  value={club.description ?? '—'}
                  full
                />
                {club.website_url && (
                  <div className="sm:col-span-2">
                    <a
                      href={club.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {club.website_url}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5" />
                  Active recruitment needs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This club hasn&apos;t posted any recruitment needs yet.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function Info({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}
