'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
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

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private (only me)' },
  { value: 'summary_only', label: 'Summary only (clubs see domain scores)' },
  { value: 'full', label: 'Full (clubs see everything)' },
];

interface DomainScore {
  domain: string;
  rawScore?: number;
  normalizedScore: number;
  percentileBand: string;
  interpretationText?: string;
}

interface AssessmentResults {
  assessmentId: string;
  status: string;
  domains: DomainScore[];
  overallScore: number | null;
  confidenceBand: string | null;
  riskFlags: string[];
  developmentSuggestions: string[];
}

function bandColor(band: string): string {
  switch (band) {
    case 'Clear strength': return 'text-green-600';
    case 'Solid': return 'text-blue-600';
    case 'Mixed': return 'text-amber-600';
    case 'Development area': return 'text-red-600';
    default: return 'text-muted-foreground';
  }
}

function bandBg(band: string): string {
  switch (band) {
    case 'Clear strength': return 'bg-green-500';
    case 'Solid': return 'bg-blue-500';
    case 'Mixed': return 'bg-amber-500';
    case 'Development area': return 'bg-red-500';
    default: return 'bg-muted';
  }
}

export default function AssessmentResults() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState('private');
  const [visUpdating, setVisUpdating] = useState(false);

  useEffect(() => {
    if (!assessmentId) return;
    api<AssessmentResults>(`/assessments/${assessmentId}/results`)
      .then((data) => {
        setResults(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [assessmentId]);

  useEffect(() => {
    if (!assessmentId) return;
    api<{ visibility: string }>(`/assessments/${assessmentId}`)
      .then((data) => setVisibility(data.visibility ?? 'private'))
      .catch(() => {});
  }, [assessmentId]);

  const handleVisibility = async (v: string) => {
    setVisUpdating(true);
    try {
      await api(`/assessments/${assessmentId}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visibility: v }),
      });
      setVisibility(v);
    } catch {
      // silent
    } finally {
      setVisUpdating(false);
    }
  };

  const radarData = results?.domains.map((d) => ({
    domain: DOMAIN_LABELS[d.domain] ?? d.domain,
    score: Number(d.normalizedScore),
  })) ?? [];

  const overallBand = results?.overallScore != null
    ? results.overallScore >= 85
      ? 'Clear strength'
      : results.overallScore >= 70
        ? 'Solid'
        : results.overallScore >= 55
          ? 'Mixed'
          : 'Development area'
    : '';

  return (
    <>
      <SiteHeader />
      <main className="container max-w-4xl py-10 space-y-8">
        <h1 className="text-3xl font-bold text-center">Assessment Results</h1>

        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : !results ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Results not available.{' '}
              <Link href="/assessment" className="underline">Go back</Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Visibility control */}
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-sm font-medium">Who can see these results?</span>
                <select
                  value={visibility}
                  onChange={(e) => handleVisibility(e.target.value)}
                  disabled={visUpdating}
                  className="text-sm border rounded-md px-3 py-1.5 bg-background"
                >
                  {VISIBILITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Overall score */}
            <Card>
              <CardContent className="p-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Overall Readiness Score</p>
                <p className={`text-6xl font-bold ${bandColor(overallBand)}`}>
                  {Math.round(results.overallScore ?? 0)}
                </p>
                <Badge className={bandBg(overallBand) + ' text-white'}>{overallBand}</Badge>
              </CardContent>
            </Card>

            {/* Confidence band */}
            {results.confidenceBand && (
              <Card>
                <CardContent className="p-4 text-sm">
                  <strong>Confidence:</strong>{' '}
                  {results.confidenceBand === 'high'
                    ? 'High confidence'
                    : results.confidenceBand === 'medium'
                      ? 'Medium confidence — some inconsistencies detected'
                      : 'Low confidence — review recommended'}
                </CardContent>
              </Card>
            )}

            {/* Radar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Domain Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Domain breakdown */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Domain Breakdown</h2>
              {results.domains.map((d) => (
                <Card key={d.domain}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {DOMAIN_LABELS[d.domain] ?? d.domain}
                      </h3>
                      <span className="text-sm font-semibold">
                        {Math.round(Number(d.normalizedScore))}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bandBg(d.percentileBand)}`}
                        style={{ width: `${Number(d.normalizedScore)}%` }}
                      />
                    </div>
                    <Badge variant="outline" className={bandColor(d.percentileBand)}>
                      {d.percentileBand}
                    </Badge>
                    {d.interpretationText && (
                      <p className="text-sm text-muted-foreground">{d.interpretationText}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Development suggestions */}
            {results.developmentSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Development Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.developmentSuggestions.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Risk flags */}
            {results.riskFlags.length > 0 && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-700">Flags</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.riskFlags.map((f, i) => (
                      <li key={i} className="text-sm text-amber-700 flex gap-2">
                        <span>⚠️</span> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer footer */}
            <p className="text-xs text-muted-foreground text-center">
              This assessment is a self-report tool and should be considered alongside video analysis,
              statistics, and coach recommendations. It is not a clinical or diagnostic instrument.
            </p>

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <Button variant="outline" disabled>
                Download PDF (coming soon)
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/assessment/consent">Retake Assessment</Link>
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
