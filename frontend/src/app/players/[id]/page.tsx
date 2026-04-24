'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DOMAIN_LABELS: Record<string, string> = {
  self_regulation: 'Self-Regulation',
  resilience: 'Resilience',
  commitment_discipline: 'Commitment & Discipline',
  achievement_motivation: 'Achievement Motivation',
  emotional_control: 'Emotional Control',
  confidence_self_belief: 'Confidence & Self-Belief',
  coachability: 'Coachability',
  team_communication: 'Team Communication',
  focus_under_pressure: 'Focus Under Pressure',
  professional_habits: 'Professional Habits',
};

interface PlayerProfile {
  id: string;
  userId?: string;
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

interface DomainScore {
  domain: string;
  normalizedScore: number;
  percentileBand: string;
  interpretationText?: string;
}

interface AssessmentData {
  assessmentId: string;
  status: string;
  domains: DomainScore[];
  overallScore: number | null;
  confidenceBand: string | null;
  riskFlags: string[];
  developmentSuggestions: string[];
}

interface RecommendationItem {
  id: string;
  coachName: string | null;
  coachRole: string | null;
  coachClub: string | null;
  overallRating: number | null;
  strengthsText: string | null;
  developmentText: string | null;
  relationshipDuration: string | null;
  wouldRecommend: boolean;
  verified: boolean;
  verificationStatus: string;
  domainRatings: Record<string, number>;
  visibility?: string;
  createdAt: string;
}

interface CoachRatingAvg {
  domain: string;
  averageRating: number;
  count: number;
}

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [coachRatings, setCoachRatings] = useState<CoachRatingAvg[]>([]);

  const isOwner = user && player?.userId === user.id;

  useEffect(() => {
    api<PlayerProfile>(`/players/${params.id}`, { skipAuth: true })
      .then((p) => {
        setPlayer(p);
        // Load recommendations
        api<RecommendationItem[]>(`/players/${params.id}/recommendations`, { skipAuth: true })
          .then(setRecommendations)
          .catch(() => {});
        // Load coach ratings
        api<CoachRatingAvg[]>(`/players/${params.id}/coach-ratings`, { skipAuth: true })
          .then(setCoachRatings)
          .catch(() => {});
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Load assessment if we have access
  useEffect(() => {
    if (!user) return;
    api<AssessmentData[]>('/assessments/mine')
      .then((list) => {
        const submitted = list.find((a) => a.status === 'submitted' || a.status === 'reviewed');
        if (submitted) {
          api<AssessmentData>(`/assessments/${(submitted as unknown as { id: string }).id}/results`)
            .then(setAssessment)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [user]);

  function handleVisChange(recId: string, vis: string) {
    api(`/recommendations/${recId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility: vis }),
    }).then(() => {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, visibility: vis } : r)),
      );
    }).catch(() => {});
  }

  // Build comparison radar data
  const comparisonData = Object.keys(DOMAIN_LABELS).map((domain) => {
    const selfScore = assessment?.domains.find((d) => d.domain === domain);
    const coachAvg = coachRatings.find((c) => c.domain === domain);
    return {
      domain: DOMAIN_LABELS[domain],
      self: selfScore ? Number(selfScore.normalizedScore) : 0,
      coach: coachAvg ? (coachAvg.averageRating / 5) * 100 : 0,
    };
  });

  const hasComparison = assessment && coachRatings.length > 0;

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

              {/* Assessment Tab */}
              <TabsContent value="assessment">
                {assessment ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Domain Scores</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                          <RadarChart data={assessment.domains.map((d) => ({
                            domain: DOMAIN_LABELS[d.domain] ?? d.domain,
                            score: Number(d.normalizedScore),
                          }))} cx="50%" cy="50%" outerRadius="75%">
                            <PolarGrid />
                            <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    {assessment.domains.map((d) => (
                      <Card key={d.domain}>
                        <CardContent className="p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{DOMAIN_LABELS[d.domain] ?? d.domain}</span>
                            <span className="text-sm">{Math.round(Number(d.normalizedScore))}/100</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{d.percentileBand}</Badge>
                          {d.interpretationText && (
                            <p className="text-xs text-muted-foreground">{d.interpretationText}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {/* Comparison Chart */}
                    {hasComparison && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Self-Assessment vs Coach Ratings</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Comparing your self-assessment with how coaches rate you can reveal blind spots and confirm strengths.
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={comparisonData} cx="50%" cy="50%" outerRadius="75%">
                              <PolarGrid />
                              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10 }} />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                              <Radar name="Self-Assessment" dataKey="self" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                              <Radar name="Coach Ratings" dataKey="coach" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                    {isOwner && (
                      <Button asChild variant="outline">
                        <a href={`/assessment/results?id=${assessment.assessmentId}`}>View Full Results</a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <EmptyState title="Assessment not available" />
                )}
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations">
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {isOwner && (
                      <Button asChild variant="outline" size="sm">
                        <a href="/dashboard/player">Request Recommendation</a>
                      </Button>
                    )}
                    {recommendations.map((r) => (
                      <Card key={r.id}>
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{r.coachName ?? 'Coach'}</span>
                              {r.coachRole && <span className="text-xs text-muted-foreground">· {r.coachRole}</span>}
                              {r.coachClub && <span className="text-xs text-muted-foreground">· {r.coachClub}</span>}
                              {r.verified && <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>}
                            </div>
                            <div className="text-amber-500 text-lg">
                              {'★'.repeat(r.overallRating ?? 0)}{'☆'.repeat(5 - (r.overallRating ?? 0))}
                            </div>
                          </div>
                          {r.relationshipDuration && (
                            <p className="text-xs text-muted-foreground">Worked together: {r.relationshipDuration}</p>
                          )}
                          {r.strengthsText && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">Strengths</p>
                              <p className="text-sm">{r.strengthsText}</p>
                            </div>
                          )}
                          {r.developmentText && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">Development</p>
                              <p className="text-sm">{r.developmentText}</p>
                            </div>
                          )}
                          {r.wouldRecommend && (
                            <Badge variant="outline" className="text-green-600 border-green-300">Would recommend</Badge>
                          )}
                          {Object.keys(r.domainRatings ?? {}).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(r.domainRatings).map(([d, v]) => (
                                <Badge key={d} variant="outline" className="text-xs">
                                  {DOMAIN_LABELS[d] ?? d}: {v}/5
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                          {isOwner && r.visibility !== undefined && (
                            <select
                              value={r.visibility}
                              onChange={(e) => handleVisChange(r.id, e.target.value)}
                              className="text-xs border rounded px-2 py-1 bg-background"
                            >
                              <option value="public">Public</option>
                              <option value="clubs_only">Clubs Only</option>
                              <option value="private">Private</option>
                            </select>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No recommendations yet" />
                )}
              </TabsContent>
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
