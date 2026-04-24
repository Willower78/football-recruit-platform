'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/verification-badge';
import { ReportModal } from '@/components/report-modal';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Flag } from 'lucide-react';

interface ClubProfile {
  id: string;
  userId: string;
  clubName: string | null;
  country: string | null;
  city: string | null;
  leagueName: string | null;
  competitionLevel: string | null;
  ageGroups: string[];
  verified: boolean;
  verificationTier: string;
  description: string | null;
  websiteUrl: string | null;
}

export default function ClubPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    api<ClubProfile>(`/clubs/${params.id}`, { skipAuth: true })
      .then(setClub)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <>
      <SiteHeader />
      <main className="container py-10 space-y-6">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <Card><CardContent className="p-6 text-destructive">{error}</CardContent></Card>
        ) : club ? (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">{club.clubName ?? 'Club'}</h1>
              <VerificationBadge
                tier={club.verificationTier as 'unverified' | 'verified' | 'official'}
                size="md"
              />
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground"
                  onClick={() => setShowReport(true)}
                >
                  <Flag size={14} className="mr-1" />
                  Report
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">
              {[club.city, club.country].filter(Boolean).join(', ')}
              {club.leagueName ? ` · ${club.leagueName}` : ''}
            </p>

            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid gap-3 md:grid-cols-2">
                  <Field label="Competition level" value={club.competitionLevel ?? '—'} />
                  <Field label="Age groups" value={club.ageGroups.join(', ') || '—'} />
                  <Field label="Website" value={club.websiteUrl ?? '—'} />
                </dl>
                {club.description && <p className="whitespace-pre-wrap">{club.description}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Active needs</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">No open needs yet.</CardContent>
            </Card>

            {showReport && (
              <ReportModal
                entityType="user"
                entityId={club.userId}
                onClose={() => setShowReport(false)}
              />
            )}
          </>
        ) : null}
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
