'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';

/* ---------- types ---------- */
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

interface Highlight {
  id: string;
  title: string;
  eventType: string;
  durationSec: number;
  clipStorageUrl: string | null;
  thumbnailUrl: string | null;
  confidence: number | null;
  featured: boolean;
}

interface ScoutingRating {
  category: string;
  score: number | null;
  aiGenerated: boolean;
}

interface ScoutingReport {
  id: string;
  scores: Record<string, number | null>;
  strengths: string[];
  weaknesses: string[];
  summaryText: string | null;
  status: string;
}

/* ---------- page ---------- */
export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [reel, setReel] = useState<Highlight[]>([]);
  const [ratings, setRatings] = useState<ScoutingRating[]>([]);
  const [report, setReport] = useState<ScoutingReport | null>(null);

  useEffect(() => {
    api<PlayerProfile>(`/players/${params.id}`, { skipAuth: true })
      .then(setPlayer)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));

    // Load highlights
    api<{ items: Highlight[] }>(`/highlights/player/${params.id}`, { skipAuth: true })
      .then((res) => setHighlights(res?.items ?? []))
      .catch(() => {});

    // Load reel
    api<Highlight[]>(`/highlights/player/${params.id}/reel`, { skipAuth: true })
      .then((res) => setReel(res ?? []))
      .catch(() => {});
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
                <TabsTrigger value="scouting">Scouting</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              {/* --- Overview --- */}
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

              {/* --- Videos --- */}
              <TabsContent value="videos">
                <div className="space-y-6">
                  {reel.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Highlight Reel</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {reel.map((h) => (
                            <HighlightCard key={h.id} highlight={h} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader><CardTitle>All Highlights</CardTitle></CardHeader>
                    <CardContent>
                      {highlights.length === 0 ? (
                        <p className="py-6 text-center text-muted-foreground">
                          No highlights available yet.
                        </p>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {highlights.map((h) => (
                            <HighlightCard key={h.id} highlight={h} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* --- Scouting --- */}
              <TabsContent value="scouting">
                <ScoutingTab playerId={params.id} />
              </TabsContent>

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

/* ---------- sub-components ---------- */

function HighlightCard({ highlight }: { highlight: Highlight }) {
  const [playing, setPlaying] = useState(false);

  return (
    <Card className="min-w-[200px]">
      <CardContent className="space-y-2 p-3">
        {playing && highlight.clipStorageUrl ? (
          <video
            src={highlight.clipStorageUrl}
            controls
            autoPlay
            className="h-32 w-full rounded object-cover"
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <div
            className="relative flex h-32 cursor-pointer items-center justify-center rounded bg-muted"
            onClick={() => setPlaying(true)}
          >
            {highlight.thumbnailUrl ? (
              <img
                src={highlight.thumbnailUrl}
                alt={highlight.title}
                className="h-full w-full rounded object-cover"
              />
            ) : (
              <span className="text-3xl">&#9654;</span>
            )}
          </div>
        )}
        <p className="text-sm font-medium">{highlight.title}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{highlight.eventType.replace('_', ' ')}</Badge>
          <span className="text-xs text-muted-foreground">
            {Math.round(highlight.durationSec)}s
          </span>
          {highlight.confidence !== null && (
            <span className="text-xs text-muted-foreground">
              {Math.round(highlight.confidence * 100)}%
            </span>
          )}
          {highlight.featured && <Badge variant="secondary">Featured</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoutingTab({ playerId }: { playerId: string }) {
  const [ratings, setRatings] = useState<ScoutingRating[]>([]);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load the latest scouting report for the player
    // This is a simplified approach — in production we'd have a dedicated endpoint
    setLoading(false);
  }, [playerId]);

  if (loading) return <Skeleton className="h-64 w-full" />;

  const DOMAINS = [
    { name: 'Technical', categories: ['First Touch & Composure', 'Passing Accuracy & Range', 'Dribbling & Ball Carrying', 'Shooting & Finishing'] },
    { name: 'Physical', categories: ['Speed & Agility', 'Strength & Stamina'] },
    { name: 'Tactical', categories: ['Off-Ball Movement', 'Decision-Making', 'Tactical Understanding'] },
    { name: 'Mental', categories: ['Game Reading', 'Mentality'] },
    { name: 'Intangibles', categories: ['Position-Specific Technique', 'Body Language'] },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scouting Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No AI analysis completed yet. Ratings will appear here after video analysis.
            </p>
          ) : (
            <div className="space-y-6">
              {DOMAINS.map((domain) => (
                <div key={domain.name}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {domain.name}
                  </h3>
                  <div className="space-y-2">
                    {domain.categories.map((cat) => {
                      const rating = ratings.find((r) => r.category === cat);
                      const score = rating?.score;

                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <span className="w-52 text-sm">{cat}</span>
                          {score !== null && score !== undefined ? (
                            <>
                              <div className="flex-1">
                                <Progress value={score * 10} />
                              </div>
                              <span className="w-10 text-right text-sm font-medium">
                                {score}/10
                              </span>
                            </>
                          ) : (
                            <span className="flex-1 rounded border border-dashed p-1 text-center text-xs text-muted-foreground">
                              Awaiting scout review
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Strengths</h4>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {report.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.weaknesses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Areas to Improve</h4>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {report.weaknesses.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.summaryText && (
              <p className="text-sm text-muted-foreground">{report.summaryText}</p>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/reports/${report.id}`}>View Full Report</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
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
