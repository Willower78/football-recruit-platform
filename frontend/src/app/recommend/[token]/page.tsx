'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const COACH_ROLES = [
  'Head Coach',
  'Assistant Coach',
  'Academy Director',
  'Youth Coach',
  'Fitness Coach',
  'Goalkeeping Coach',
  'Scout',
  'Other',
];

const DURATIONS = [
  'Less than 6 months',
  '6-12 months',
  '1-2 years',
  '2-3 years',
  '3+ years',
];

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

const DOMAIN_HINTS: Record<string, string> = {
  self_regulation: 'Planning, monitoring, and managing training habits',
  resilience: 'Bouncing back from setbacks and adversity',
  commitment_discipline: 'Work ethic, consistency, and dedication',
  achievement_motivation: 'Drive to set and achieve ambitious goals',
  emotional_control: 'Managing emotions under pressure',
  confidence_self_belief: 'Trust in own ability',
  coachability: 'Openness to feedback and willingness to learn',
  team_communication: 'Leadership and collaboration with teammates',
  focus_under_pressure: 'Concentration in high-stakes moments',
  professional_habits: 'Off-field discipline and career management',
};

interface FormInfo {
  playerName: string;
  playerPosition: string | null;
  playerCity: string | null;
  playerCountry: string | null;
  playerCurrentClub: string | null;
  coachName: string;
  domains: string[];
}

export default function RecommendSubmit({ params }: { params: { token: string } }) {
  const [info, setInfo] = useState<FormInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [coachName, setCoachName] = useState('');
  const [coachRole, setCoachRole] = useState('');
  const [coachClub, setCoachClub] = useState('');
  const [duration, setDuration] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [strengths, setStrengths] = useState('');
  const [development, setDevelopment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [domainRatings, setDomainRatings] = useState<Record<string, number>>({});
  const [showDomainRatings, setShowDomainRatings] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/recommendations/submit/${params.token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? 'Invalid or expired link');
        }
        return res.json() as Promise<FormInfo>;
      })
      .then((data) => {
        setInfo(data);
        setCoachName(data.coachName ?? '');
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overallRating < 1) {
      setError('Please provide an overall rating');
      return;
    }
    if (strengths.length < 50) {
      setError('Strengths must be at least 50 characters');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const dr: Record<string, number> = {};
      for (const [k, v] of Object.entries(domainRatings)) {
        if (v >= 1 && v <= 5) dr[k] = v;
      }
      const res = await fetch(`${API_BASE}/recommendations/submit/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_name: coachName,
          coach_role: coachRole || undefined,
          coach_club: coachClub || undefined,
          relationship_duration: duration || undefined,
          overall_rating: overallRating,
          strengths_text: strengths,
          development_text: development || undefined,
          domain_ratings: Object.keys(dr).length > 0 ? dr : undefined,
          would_recommend: wouldRecommend,
          additional_notes: additionalNotes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Failed to submit');
      }
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="container max-w-2xl py-16 text-center text-muted-foreground">
        Loading...
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="container max-w-2xl py-16">
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <h1 className="text-2xl font-bold">Thank You!</h1>
            <p className="text-muted-foreground">
              Your recommendation for <strong>{info?.playerName}</strong> has been submitted.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error && !info) {
    return (
      <main className="container max-w-2xl py-16">
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <h1 className="text-xl font-bold text-destructive">Unable to Load</h1>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl py-10 space-y-6">
      <h1 className="text-2xl font-bold text-center">
        Recommendation for {info?.playerName}
      </h1>

      {/* Player info card */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4 text-sm">
          <div>
            <p className="font-medium">{info?.playerName}</p>
            <p className="text-muted-foreground">
              {[info?.playerPosition, info?.playerCurrentClub, info?.playerCity, info?.playerCountry]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* About You */}
        <Card>
          <CardHeader><CardTitle>About You</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={coachName} onChange={(e) => setCoachName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={coachRole}
                onChange={(e) => setCoachRole(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              >
                <option value="">Select role...</option>
                {COACH_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Club / Organization</Label>
              <Input value={coachClub} onChange={(e) => setCoachClub(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>How long have you worked with this player?</Label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              >
                <option value="">Select...</option>
                {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Overall rating */}
        <Card>
          <CardHeader><CardTitle>Overall Rating</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">How would you rate this player overall?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOverallRating(s)}
                  className="text-3xl transition-transform hover:scale-110"
                  aria-label={`${s} stars`}
                >
                  {s <= overallRating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader><CardTitle>Strengths</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Label>What are this player&apos;s key strengths?</Label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              required
              minLength={50}
              rows={4}
              placeholder="Describe the player's strongest qualities — technical, tactical, physical, mental, or character traits..."
              className="w-full rounded-md border px-3 py-2 text-sm bg-background resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {strengths.length}/50 minimum characters
            </p>
          </CardContent>
        </Card>

        {/* Development */}
        <Card>
          <CardHeader><CardTitle>Areas for Development</CardTitle></CardHeader>
          <CardContent>
            <textarea
              value={development}
              onChange={(e) => setDevelopment(e.target.value)}
              rows={3}
              placeholder="What areas could this player improve?"
              className="w-full rounded-md border px-3 py-2 text-sm bg-background resize-y"
            />
          </CardContent>
        </Card>

        {/* Domain ratings */}
        <Card>
          <CardHeader>
            <button
              type="button"
              onClick={() => setShowDomainRatings(!showDomainRatings)}
              className="flex items-center gap-2 text-left"
            >
              <CardTitle>Detailed Domain Ratings (Optional)</CardTitle>
              <Badge variant="outline">{showDomainRatings ? '▼' : '▶'}</Badge>
            </button>
          </CardHeader>
          {showDomainRatings && (
            <CardContent className="space-y-4">
              {(info?.domains ?? []).map((d) => (
                <div key={d} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{DOMAIN_LABELS[d] ?? d}</p>
                      <p className="text-xs text-muted-foreground">{DOMAIN_HINTS[d] ?? ''}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setDomainRatings((prev) => ({ ...prev, [d]: v }))}
                          className={`w-8 h-8 rounded text-xs border transition-colors ${
                            domainRatings[d] === v
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Final questions */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Label>Would you recommend this player?</Label>
              <button
                type="button"
                onClick={() => setWouldRecommend(!wouldRecommend)}
                className={`px-4 py-1 rounded-full text-sm border transition-colors ${
                  wouldRecommend
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-red-100 border-red-300 text-red-800'
                }`}
              >
                {wouldRecommend ? 'Yes' : 'No'}
              </button>
            </div>
            <div className="space-y-2">
              <Label>Additional notes (optional)</Label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background resize-y"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Recommendation'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your recommendation will appear on the player&apos;s profile.
          The player controls who can see it.
        </p>
      </form>
    </main>
  );
}
