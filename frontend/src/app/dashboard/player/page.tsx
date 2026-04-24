'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface AssessmentSummary {
  id: string;
  status: string;
  responseCount: number;
  metadata: { overall_score?: number };
}

interface RecRequest {
  id: string;
  coachName: string | null;
  coachEmail: string;
  status: string;
  sentAt: string | null;
  remindedAt: string | null;
  createdAt: string;
}

interface RecSummary {
  coachName: string | null;
  overallRating: number | null;
  createdAt: string;
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
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [recRequests, setRecRequests] = useState<RecRequest[]>([]);
  const [recommendations, setRecommendations] = useState<RecSummary[]>([]);
  const [showRecModal, setShowRecModal] = useState(false);
  const [recCoachName, setRecCoachName] = useState('');
  const [recCoachEmail, setRecCoachEmail] = useState('');
  const [recSending, setRecSending] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  useEffect(() => {
    api<PlayerProfile>('/players/me')
      .then((p) => {
        setProfile(p);
        // Load recommendations for this player
        api<RecSummary[]>(`/players/${p.id}/recommendations`, { skipAuth: true })
          .then(setRecommendations)
          .catch(() => {});
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));

    api<AssessmentSummary[]>('/assessments/mine')
      .then(setAssessments)
      .catch(() => {});

    api<RecRequest[]>('/recommendations/requests/mine')
      .then(setRecRequests)
      .catch(() => {});
  }, []);

  const latestAssessment = assessments[0];
  const assessmentStatus = latestAssessment
    ? latestAssessment.status === 'draft'
      ? `In progress (${latestAssessment.responseCount}/100)`
      : `Completed — Score: ${Math.round(latestAssessment.metadata?.overall_score ?? 0)}/100`
    : 'Not started';

  const assessmentCta = latestAssessment
    ? latestAssessment.status === 'draft'
      ? { label: 'Continue', href: `/assessment/questions?id=${latestAssessment.id}` }
      : { label: 'View Results', href: `/assessment/results?id=${latestAssessment.id}` }
    : { label: 'Start', href: '/assessment' };

  async function handleRecRequest() {
    setRecSending(true);
    setRecError(null);
    try {
      await api('/recommendations/request', {
        method: 'POST',
        body: JSON.stringify({ coach_name: recCoachName, coach_email: recCoachEmail }),
      });
      setShowRecModal(false);
      setRecCoachName('');
      setRecCoachEmail('');
      const updated = await api<RecRequest[]>('/recommendations/requests/mine');
      setRecRequests(updated);
    } catch (e) {
      setRecError((e as Error).message);
    } finally {
      setRecSending(false);
    }
  }

  async function handleRemind(id: string) {
    try {
      await api(`/recommendations/requests/${id}/remind`, { method: 'POST' });
      const updated = await api<RecRequest[]>('/recommendations/requests/mine');
      setRecRequests(updated);
    } catch {
      // silent
    }
  }

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

        {/* Assessment Card */}
        <Card>
          <CardHeader>
            <CardTitle>Readiness Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{assessmentStatus}</p>
            <Button asChild variant="outline" size="sm">
              <Link href={assessmentCta.href}>{assessmentCta.label}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recommendations ({recommendations.length})</CardTitle>
            <Button size="sm" onClick={() => setShowRecModal(true)}>
              Request Recommendation
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{r.coachName ?? 'Coach'}</span>
                    <span className="text-amber-500">{'★'.repeat(r.overallRating ?? 0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recommendations yet</p>
            )}
          </CardContent>
        </Card>

        {/* Rec Request Modal */}
        {showRecModal && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Request Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We&apos;ll send an email to your coach with a link to submit a recommendation. They don&apos;t need an account.
              </p>
              <div className="space-y-2">
                <Label>Coach Name</Label>
                <Input value={recCoachName} onChange={(e) => setRecCoachName(e.target.value)} placeholder="e.g. John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Coach Email</Label>
                <Input type="email" value={recCoachEmail} onChange={(e) => setRecCoachEmail(e.target.value)} placeholder="coach@example.com" />
              </div>
              {recError && <p className="text-sm text-destructive">{recError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleRecRequest} disabled={recSending || !recCoachName || !recCoachEmail}>
                  {recSending ? 'Sending...' : 'Send Request'}
                </Button>
                <Button variant="ghost" onClick={() => setShowRecModal(false)}>Cancel</Button>
              </div>

              {/* Pending requests */}
              {recRequests.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Sent Requests</p>
                  {recRequests.map((rr) => (
                    <div key={rr.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span>{rr.coachName ?? rr.coachEmail}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {rr.status === 'pending' ? 'Awaiting response' : rr.status === 'completed' ? 'Received' : rr.status}
                        </Badge>
                      </div>
                      {rr.status === 'pending' && !rr.remindedAt && (
                        <Button variant="ghost" size="sm" onClick={() => handleRemind(rr.id)}>
                          Remind
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/search">Discover clubs</Link></Button>
            <Button asChild variant="outline"><Link href="/onboarding/player">Update profile</Link></Button>
            <Button asChild variant="outline"><Link href="/assessment">Assessment</Link></Button>
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
