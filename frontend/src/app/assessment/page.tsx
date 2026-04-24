'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface AssessmentSummary {
  id: string;
  status: 'draft' | 'submitted' | 'reviewed';
  responseCount: number;
  completedAt: string | null;
  metadata: { overall_score?: number };
}

const DOMAINS = [
  { name: 'Self-Regulation', icon: '🎯' },
  { name: 'Resilience', icon: '💪' },
  { name: 'Commitment & Discipline', icon: '🏋️' },
  { name: 'Achievement Motivation', icon: '🚀' },
  { name: 'Emotional Control', icon: '🧘' },
  { name: 'Confidence & Self-Belief', icon: '⭐' },
  { name: 'Coachability', icon: '📋' },
  { name: 'Team Communication', icon: '🗣️' },
  { name: 'Focus Under Pressure', icon: '🎯' },
  { name: 'Professional Habits', icon: '👔' },
];

export default function AssessmentLanding() {
  const { user, loading: authLoading } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isPremium = (user as unknown as { subscriptionPlan?: string })?.subscriptionPlan === 'premium';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    api<AssessmentSummary[]>('/assessments/mine')
      .then(setAssessments)
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const draft = assessments.find((a) => a.status === 'draft');
  const submitted = assessments.find((a) => a.status === 'submitted' || a.status === 'reviewed');

  return (
    <>
      <SiteHeader />
      <main className="container max-w-4xl py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Player Readiness Assessment</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A 100-question self-report tool measuring 10 key performance psychology domains.
            Understand your mental readiness and show clubs your full profile.
          </p>
        </div>

        {/* Domain overview */}
        <Card>
          <CardHeader>
            <CardTitle>What it measures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {DOMAINS.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{d.icon}</span>
                  <span>{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action area */}
        {!user || loading || authLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {authLoading || loading ? 'Loading...' : 'Sign in to take the assessment'}
            </CardContent>
          </Card>
        ) : !isPremium ? (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-8 text-center space-y-4">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">Premium Feature</Badge>
              <h2 className="text-xl font-semibold">Unlock the Full Assessment</h2>
              <p className="text-muted-foreground">
                100 questions across 10 domains, scored with interpretation and development suggestions.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                Upgrade to Premium — €5/month
              </Button>
            </CardContent>
          </Card>
        ) : draft ? (
          <Card>
            <CardContent className="p-8 space-y-4">
              <h2 className="text-xl font-semibold">Continue Your Assessment</h2>
              <Progress value={(draft.responseCount / 100) * 100} />
              <p className="text-sm text-muted-foreground">
                {draft.responseCount}/100 questions answered
              </p>
              <Button asChild>
                <Link href={`/assessment/questions?id=${draft.id}`}>Continue Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        ) : submitted ? (
          <Card>
            <CardContent className="p-8 space-y-4">
              <h2 className="text-xl font-semibold">Assessment Completed</h2>
              <p className="text-muted-foreground">
                Overall score: <strong>{submitted.metadata?.overall_score ?? '—'}/100</strong>
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href={`/assessment/results?id=${submitted.id}`}>View Results</Link>
                </Button>
                <Button variant="outline" onClick={() => router.push('/assessment/consent')}>
                  Retake Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 space-y-4 text-center">
              <h2 className="text-xl font-semibold">Ready to Start?</h2>
              <p className="text-muted-foreground">
                100 questions · ~15 minutes · Save & resume anytime
              </p>
              <Button asChild size="lg">
                <Link href="/assessment/consent">Start Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
