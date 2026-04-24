'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/* ---------- Types ---------- */

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

interface AggregateRating {
  categorySlug: string;
  avgScore: number | null;
  maxScore: number | null;
  latestScore: number | null;
  reportCount: number;
}

interface RatingFormEntry {
  categorySlug: string;
  score: number;
  notes: string;
  confidence: number;
}

const CATEGORY_META: Record<string, { name: string; domain: string }> = {
  first_touch_composure: { name: 'First Touch & Composure', domain: 'technical' },
  passing_accuracy_range: { name: 'Passing Accuracy & Range', domain: 'technical' },
  dribbling_ball_carrying: { name: 'Dribbling & Ball Carrying', domain: 'technical' },
  shooting_finishing: { name: 'Shooting & Finishing', domain: 'technical' },
  position_specific_technique: { name: 'Position-Specific Technique', domain: 'technical' },
  off_ball_movement: { name: 'Off-Ball Movement', domain: 'tactical' },
  game_reading_anticipation: { name: 'Game Reading & Anticipation', domain: 'tactical' },
  tactical_role_understanding: { name: 'Tactical Role Understanding', domain: 'tactical' },
  speed_agility: { name: 'Speed & Agility', domain: 'physical' },
  strength_stamina: { name: 'Strength & Stamina', domain: 'physical' },
  decision_making: { name: 'Decision-Making Under Pressure', domain: 'mental' },
  mentality_discipline: { name: 'Mentality & Discipline', domain: 'mental' },
  body_language_consistency: { name: 'Body Language & Consistency', domain: 'intangibles' },
};

const DOMAINS = ['technical', 'tactical', 'physical', 'mental', 'intangibles'];

const DOMAIN_LABELS: Record<string, string> = {
  technical: 'Technical',
  tactical: 'Tactical',
  physical: 'Physical',
  mental: 'Mental',
  intangibles: 'Intangibles',
};

/* ---------- Helpers ---------- */

function domainAverage(ratings: AggregateRating[], domain: string): number | null {
  const cats = Object.entries(CATEGORY_META)
    .filter(([, m]) => m.domain === domain)
    .map(([slug]) => slug);
  const scores = cats
    .map((slug) => ratings.find((r) => r.categorySlug === slug)?.avgScore)
    .filter((s): s is number => s != null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/* ---------- Radar Chart (SVG) ---------- */

function RadarChart({ values, labels }: { values: (number | null)[]; labels: string[] }) {
  const n = labels.length;
  const cx = 120, cy = 120, r = 90;
  const angleStep = (2 * Math.PI) / n;

  const pointsVal = values.map((v, i) => {
    const pct = (v ?? 0) / 10;
    const a = angleStep * i - Math.PI / 2;
    return `${cx + r * pct * Math.cos(a)},${cy + r * pct * Math.sin(a)}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 240 240" className="mx-auto h-64 w-64">
      {/* grid circles */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={labels.map((_, i) => {
            const a = angleStep * i - Math.PI / 2;
            return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`;
          }).join(' ')}
          fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"
        />
      ))}
      {/* axes */}
      {labels.map((_, i) => {
        const a = angleStep * i - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="hsl(var(--border))" strokeWidth="0.5" />;
      })}
      {/* data polygon */}
      <polygon points={pointsVal} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
      {/* labels */}
      {labels.map((label, i) => {
        const a = angleStep * i - Math.PI / 2;
        const lx = cx + (r + 16) * Math.cos(a);
        const ly = cy + (r + 16) * Math.sin(a);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[8px]">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ---------- Main ---------- */

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<AggregateRating[]>([]);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const isScoutOrClub = user && ['scout', 'club', 'admin'].includes(user.role);

  useEffect(() => {
    api<PlayerProfile>(`/players/${params.id}`, { skipAuth: true })
      .then(setPlayer)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));

    api<AggregateRating[]>(`/players/${params.id}/ratings`, { skipAuth: true })
      .then(setRatings)
      .catch(() => {});
  }, [params.id]);

  const domainAverages = DOMAINS.map((d) => domainAverage(ratings, d));

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

            {/* Domain summary badges */}
            {ratings.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {DOMAINS.map((d, i) => {
                  const avg = domainAverages[i];
                  if (avg == null) return null;
                  return (
                    <div key={d} className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm">
                      <span className="capitalize text-muted-foreground">{DOMAIN_LABELS[d]}</span>
                      <span className="font-semibold">{avg.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scouting">Scouting</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
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

                    {ratings.length > 0 && (
                      <div className="pt-4">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Scouting Summary</h3>
                        <RadarChart values={domainAverages} labels={DOMAINS.map((d) => DOMAIN_LABELS[d])} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* --- Scouting Tab --- */}
              <TabsContent value="scouting">
                <div className="space-y-6">
                  {/* Radar chart */}
                  <Card>
                    <CardContent className="p-6">
                      <RadarChart values={domainAverages} labels={DOMAINS.map((d) => DOMAIN_LABELS[d])} />
                    </CardContent>
                  </Card>

                  {/* Detailed breakdown by domain */}
                  {DOMAINS.map((domain) => {
                    const cats = Object.entries(CATEGORY_META).filter(([, m]) => m.domain === domain);
                    return (
                      <Card key={domain}>
                        <CardHeader>
                          <CardTitle className="capitalize">{DOMAIN_LABELS[domain]}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {cats.map(([slug, meta]) => {
                            const r = ratings.find((x) => x.categorySlug === slug);
                            return (
                              <div key={slug} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{meta.name}</span>
                                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {r ? (
                                      <>
                                        <span>Avg: <strong className="text-foreground">{Number(r.avgScore).toFixed(1)}</strong></span>
                                        <span>Max: <strong className="text-foreground">{Number(r.maxScore).toFixed(1)}</strong></span>
                                        <span>Latest: <strong className="text-foreground">{Number(r.latestScore).toFixed(1)}</strong></span>
                                        <span>({r.reportCount} report{r.reportCount !== 1 ? 's' : ''})</span>
                                      </>
                                    ) : '—'}
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${((r?.avgScore ?? 0) / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Rate button for scouts/clubs */}
                  {isScoutOrClub && (
                    <div className="text-center">
                      <Button onClick={() => setShowRatingForm(true)}>Rate This Player</Button>
                    </div>
                  )}

                  {/* Rating form modal */}
                  {showRatingForm && (
                    <RatingFormPanel
                      playerId={params.id}
                      onClose={() => setShowRatingForm(false)}
                      onSubmitted={(newRatings) => {
                        setRatings(newRatings);
                        setShowRatingForm(false);
                      }}
                    />
                  )}
                </div>
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

/* ---------- Rating Form ---------- */

function RatingFormPanel({
  playerId,
  onClose,
  onSubmitted,
}: {
  playerId: string;
  onClose: () => void;
  onSubmitted: (ratings: AggregateRating[]) => void;
}) {
  const slugs = Object.keys(CATEGORY_META);
  const [entries, setEntries] = useState<RatingFormEntry[]>(
    slugs.map((slug) => ({ categorySlug: slug, score: 5, notes: '', confidence: 0.8 })),
  );
  const [reportId, setReportId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  function updateEntry(idx: number, field: keyof RatingFormEntry, val: string | number) {
    setEntries((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  }

  async function submit() {
    if (!reportId.trim()) {
      setErr('Enter a Scouting Report ID first (create a report for this player if none exists).');
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      await api(`/scouting-reports/${reportId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({
          ratings: entries.map((e) => ({
            categorySlug: e.categorySlug,
            score: e.score,
            confidence: e.confidence,
            notes: e.notes || undefined,
          })),
        }),
      });
      const updated = await api<AggregateRating[]>(`/players/${playerId}/ratings`, { skipAuth: true });
      onSubmitted(updated);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rate Player</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Scouting Report ID</Label>
          <Input
            placeholder="UUID of existing scouting report"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Ratings must be linked to a scouting report.</p>
        </div>

        {DOMAINS.map((domain) => {
          const cats = Object.entries(CATEGORY_META).filter(([, m]) => m.domain === domain);
          return (
            <div key={domain}>
              <h4 className="mb-2 text-sm font-medium capitalize">{DOMAIN_LABELS[domain]}</h4>
              <div className="space-y-3">
                {cats.map(([slug, meta]) => {
                  const idx = slugs.indexOf(slug);
                  const entry = entries[idx];
                  return (
                    <div key={slug} className="space-y-1 rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{meta.name}</Label>
                        <span className="text-sm font-bold">{entry.score}/10</span>
                      </div>
                      <input
                        type="range" min={1} max={10} step={1}
                        value={entry.score}
                        onChange={(e) => updateEntry(idx, 'score', Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <Input
                        placeholder="Notes (optional)"
                        value={entry.notes}
                        onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting ? 'Submitting...' : 'Submit Ratings'}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ---------- Shared components ---------- */

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
