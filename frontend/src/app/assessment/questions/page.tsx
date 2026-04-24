'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';

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

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  self_regulation: 'How you plan, monitor, and manage your training and lifestyle habits.',
  resilience: 'How you bounce back from setbacks and maintain composure.',
  commitment_discipline: 'Your consistency, work ethic, and dedication to improvement.',
  achievement_motivation: 'Your drive to set and pursue ambitious performance goals.',
  emotional_control: 'How you manage emotions under frustration or pressure.',
  confidence_self_belief: 'Your trust in your ability and willingness to take responsibility.',
  coachability: 'Your openness to feedback and willingness to learn.',
  team_communication: 'How you lead, encourage, and collaborate with teammates.',
  focus_under_pressure: 'Your concentration and execution in high-stakes moments.',
  professional_habits: 'Your off-field discipline, nutrition, recovery, and career management.',
};

const LIKERT = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

interface Question {
  id: string;
  questionText: string;
  sortOrder: number;
}

export default function AssessmentQuestions() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const router = useRouter();

  const [domains, setDomains] = useState<[string, Question[]][]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentDomain, setCurrentDomain] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Load existing responses
  useEffect(() => {
    if (!assessmentId) return;
    api<{ responses?: { questionId: string; scoreInt: number }[] }>(`/assessments/${assessmentId}`)
      .then((data) => {
        if (data.responses) {
          const map: Record<string, number> = {};
          for (const r of data.responses) {
            map[r.questionId] = r.scoreInt;
          }
          setAnswers(map);
        }
      })
      .catch(() => {});
  }, [assessmentId]);

  useEffect(() => {
    api<Record<string, Question[]>>('/assessments/questions', { skipAuth: true })
      .then((data) => {
        const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
        setDomains(entries);
      })
      .catch(() => {});
  }, []);

  const totalAnswered = useMemo(() => Object.keys(answers).length, [answers]);
  const totalQuestions = useMemo(
    () => domains.reduce((sum, [, qs]) => sum + qs.length, 0),
    [domains],
  );

  const currentQuestions = domains[currentDomain]?.[1] ?? [];
  const currentDomainKey = domains[currentDomain]?.[0] ?? '';

  const setAnswer = useCallback((questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  }, []);

  const saveDomain = useCallback(async () => {
    if (!assessmentId) return;
    const responses = currentQuestions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({ question_id: q.id, score_int: answers[q.id] }));
    if (responses.length === 0) return;
    setSaving(true);
    try {
      await api(`/assessments/${assessmentId}/responses`, {
        method: 'POST',
        body: JSON.stringify({ responses }),
      });
    } catch {
      // silent — draft save
    } finally {
      setSaving(false);
    }
  }, [assessmentId, currentQuestions, answers]);

  const handleNext = async () => {
    await saveDomain();
    if (currentDomain < domains.length - 1) {
      setCurrentDomain((d) => d + 1);
      window.scrollTo(0, 0);
    } else {
      setShowReview(true);
    }
  };

  const handleBack = () => {
    if (showReview) {
      setShowReview(false);
    } else if (currentDomain > 0) {
      setCurrentDomain((d) => d - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveAndExit = async () => {
    await saveDomain();
    router.push('/assessment');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Save current domain first
      await saveDomain();
      await api(`/assessments/${assessmentId}/submit`, { method: 'POST' });
      router.push(`/assessment/results?id=${assessmentId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!assessmentId) {
    return (
      <>
        <SiteHeader />
        <main className="container py-10 text-center text-muted-foreground">
          No assessment ID provided. <a href="/assessment" className="underline">Go back</a>.
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container max-w-3xl py-6 space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {showReview
                ? 'Review your answers'
                : `Domain ${currentDomain + 1} of ${domains.length} — ${DOMAIN_LABELS[currentDomainKey] ?? currentDomainKey}`}
            </span>
            <span>{totalAnswered}/{totalQuestions}</span>
          </div>
          <Progress value={totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0} />
        </div>

        {showReview ? (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Submit?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You&apos;ve answered <strong>{totalAnswered}</strong> of <strong>{totalQuestions}</strong> questions.
              </p>
              {totalAnswered < totalQuestions && (
                <p className="text-amber-600 text-sm">
                  You still have {totalQuestions - totalAnswered} unanswered questions. All 100 must be answered to submit.
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack}>Review Answers</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || totalAnswered < totalQuestions}
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{DOMAIN_LABELS[currentDomainKey] ?? currentDomainKey}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {DOMAIN_DESCRIPTIONS[currentDomainKey] ?? ''}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium">
                    {(currentDomain * 10) + idx + 1}. {q.questionText}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LIKERT.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                          answers[q.id] === opt.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted border-border'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {!showReview && (
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} disabled={currentDomain === 0}>
                Back
              </Button>
              <Button variant="ghost" onClick={handleSaveAndExit}>
                {saving ? 'Saving...' : 'Save & Exit'}
              </Button>
            </div>
            <Button onClick={handleNext}>
              {currentDomain < domains.length - 1 ? 'Next Domain' : 'Review'}
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
