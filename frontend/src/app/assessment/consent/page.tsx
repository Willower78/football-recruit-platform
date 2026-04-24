'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function AssessmentConsent() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleBegin() {
    setLoading(true);
    setError(null);
    try {
      const consent = await api<{ id: string }>('/consents', {
        method: 'POST',
        body: JSON.stringify({ consentType: 'scouting_ai', granted: true }),
      });
      const assessment = await api<{ id: string }>('/assessments', {
        method: 'POST',
        body: JSON.stringify({ consent_id: consent.id }),
      });
      router.push(`/assessment/questions?id=${assessment.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container max-w-2xl py-10 space-y-6">
        <h1 className="text-2xl font-bold text-center">Assessment Consent</h1>

        <Card>
          <CardHeader>
            <CardTitle>Before you begin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-1">Purpose</h3>
              <p className="text-muted-foreground">
                This assessment helps you understand your performance mindset and helps clubs
                see your readiness profile.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">What&apos;s measured</h3>
              <p className="text-muted-foreground">
                10 domains: Self-Regulation, Resilience, Commitment & Discipline, Achievement Motivation,
                Emotional Control, Confidence & Self-Belief, Coachability, Team Communication,
                Focus Under Pressure, and Professional Habits.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Who sees results</h3>
              <p className="text-muted-foreground">
                Only you by default. You control whether clubs see a summary or full results.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Data retention</h3>
              <p className="text-muted-foreground">
                Your responses are stored securely. You can delete them at any time.
              </p>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-amber-800 dark:text-amber-200 text-xs font-medium">
                Disclaimer: This is NOT a clinical diagnosis, mental health screening, or medical
                assessment. It is one input among many in the recruitment process.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">
                I understand and consent to taking this assessment
              </span>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleBegin}
              disabled={!agreed || loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Starting...' : 'Begin Assessment'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
