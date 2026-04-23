'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, ClipboardList, Video } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { PublicHeader } from '@/components/public-header';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

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

function computeAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<PlayerProfile>(`/players/${id}`, { token: accessToken ?? undefined })
      .then(setProfile)
      .catch((err) => {
        setError(
          err?.status === 403
            ? 'This profile is private or visible to clubs only.'
            : 'Player not found.',
        );
      });
  }, [id, accessToken]);

  const age = computeAge(profile?.date_of_birth ?? null);
  const initials = (profile?.full_name ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle>Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : !profile ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h1 className="text-2xl font-semibold">
                      {profile.full_name ?? 'Unnamed player'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {[profile.nationality, profile.city, profile.country]
                        .filter(Boolean)
                        .join(' · ') || 'Location unknown'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.primary_position && (
                      <Badge>{profile.primary_position}</Badge>
                    )}
                    {age !== null && <Badge variant="secondary">{age} yrs</Badge>}
                    {profile.availability_status && (
                      <Badge variant="success">
                        {profile.availability_status.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                    <Info label="Bio" value={profile.bio ?? '—'} />
                    <Info label="Dominant foot" value={profile.dominant_foot ?? '—'} />
                    <Info
                      label="Height"
                      value={profile.height_cm ? `${profile.height_cm} cm` : '—'}
                    />
                    <Info
                      label="Weight"
                      value={profile.weight_kg ? `${profile.weight_kg} kg` : '—'}
                    />
                    <Info label="Current club" value={profile.current_club ?? '—'} />
                    <Info
                      label="Location"
                      value={
                        [profile.city, profile.country].filter(Boolean).join(', ') ||
                        '—'
                      }
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="videos">
                <EmptyState
                  icon={Video}
                  title="No videos uploaded yet"
                  description="When this player uploads highlights, they will appear here."
                />
              </TabsContent>

              <TabsContent value="stats">
                <EmptyState
                  icon={Activity}
                  title="No season stats available"
                  description="Season-by-season stats will show up once added."
                />
              </TabsContent>

              <TabsContent value="assessment">
                <EmptyState
                  icon={Activity}
                  title="Assessment not completed"
                  description="This player hasn't taken the psychological assessment yet."
                />
              </TabsContent>

              <TabsContent value="recommendations">
                <EmptyState
                  icon={ClipboardList}
                  title="No recommendations yet"
                  description="Coach recommendations will be listed here once requested and completed."
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Video;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
        <Icon className="h-10 w-10 text-muted-foreground" />
        <div className="text-lg font-medium">{title}</div>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
