'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface PlayerProfile {
  id: string;
  fullName: string | null;
  primaryPosition: string | null;
  secondaryPositions: string[];
  city: string | null;
  country: string | null;
  currentClub: string | null;
  freeAgent: boolean;
  availabilityStatus: string;
  dominantFoot: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bio: string | null;
}

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<PlayerProfile>(`/players/${params.id}`, { skipAuth: true })
      .then(setPlayer)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <Card><CardContent className="p-6 text-destructive">{error}</CardContent></Card>
        ) : player ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 text-lg">
                <AvatarFallback>
                  {(player.fullName ?? 'P').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-semibold">{player.fullName ?? 'Player'}</h1>
                <p className="text-muted-foreground">
                  {player.primaryPosition ?? '—'} · {player.city}, {player.country}
                </p>
                {player.freeAgent && <Badge variant="secondary" className="mt-1">Free agent</Badge>}
              </div>
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <dl className="grid gap-3 md:grid-cols-2">
                      <Field label="Foot" value={player.dominantFoot ?? '—'} />
                      <Field label="Height" value={player.heightCm ? `${player.heightCm} cm` : '—'} />
                      <Field label="Weight" value={player.weightKg ? `${player.weightKg} kg` : '—'} />
                      <Field label="Current club" value={player.currentClub ?? (player.freeAgent ? 'Free agent' : '—')} />
                      <Field label="Secondary positions" value={player.secondaryPositions.join(', ') || '—'} />
                      <Field label="Availability" value={player.availabilityStatus.replace('_', ' ')} />
                    </dl>
                    {player.bio && <p className="whitespace-pre-wrap">{player.bio}</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="videos"><EmptyState title="No videos yet" /></TabsContent>
              <TabsContent value="stats"><EmptyState title="No stats recorded yet" /></TabsContent>
              <TabsContent value="assessment"><EmptyState title="Assessment not completed" /></TabsContent>
              <TabsContent value="recommendations"><EmptyState title="No recommendations yet" /></TabsContent>
            </Tabs>
          </div>
        ) : null}
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="capitalize">{value}</dd>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-[160px] flex-col items-center justify-center text-muted-foreground">
        {title}
      </CardContent>
    </Card>
  );
}
