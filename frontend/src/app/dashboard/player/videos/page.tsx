'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

/* ---------- types ---------- */
interface Integration {
  id: string;
  platform: string;
  status: string;
  createdAt: string;
}

interface ImportedMatch {
  id: string;
  platform: string;
  matchTitle: string | null;
  matchDate: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
  durationSec: number | null;
  platformThumbnailUrl: string | null;
  importStatus: string;
}

interface AnalysisJob {
  id: string;
  status: string;
  progressPct: number;
  currentStage: string | null;
  videoId: string | null;
  importedMatchId: string | null;
  createdAt: string;
  errorMessage: string | null;
  scoutingReportId: string | null;
}

/* ---------- platform helpers ---------- */
const PLATFORMS = [
  { key: 'veo', label: 'VEO', available: true },
  { key: 'hudl', label: 'Hudl', available: false },
  { key: 'trace', label: 'Trace', available: false },
  { key: 'pixellot', label: 'Pixellot', available: false },
] as const;

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="secondary">Connected</Badge>;
  if (status === 'expired') return <Badge variant="outline">Expired</Badge>;
  return <Badge variant="destructive">Revoked</Badge>;
}

function jobStatusDisplay(job: AnalysisJob) {
  switch (job.status) {
    case 'queued':
      return <span className="text-sm text-muted-foreground">Waiting in queue...</span>;
    case 'completed':
      return (
        <Link href={`/reports/${job.scoutingReportId ?? job.id}`} className="text-sm text-primary underline">
          View Report
        </Link>
      );
    case 'failed':
      return <span className="text-sm text-destructive">{job.errorMessage ?? 'Failed'}</span>;
    default:
      return (
        <div className="space-y-1">
          <Progress value={job.progressPct} />
          <p className="text-xs text-muted-foreground">
            {job.currentStage ?? job.status} — {job.progressPct}%
          </p>
        </div>
      );
  }
}

/* ---------- page ---------- */
export default function VideosPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [matches, setMatches] = useState<ImportedMatch[]>([]);
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [intRes, matchRes, jobsRes] = await Promise.all([
        api<Integration[]>('/video-integrations'),
        api<{ items: ImportedMatch[] }>('/imported-matches'),
        api<{ items: AnalysisJob[] }>('/analysis-jobs'),
      ]);
      setIntegrations(intRes ?? []);
      setMatches(matchRes?.items ?? []);
      setJobs(jobsRes?.items ?? []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for active job progress
  useEffect(() => {
    const hasActive = jobs.some(
      (j) => !['completed', 'failed'].includes(j.status),
    );
    if (hasActive) {
      pollRef.current = setInterval(fetchData, 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobs, fetchData]);

  const connectedPlatforms = new Set(
    integrations.filter((i) => i.status === 'active').map((i) => i.platform),
  );

  async function syncMatches(integrationId: string) {
    await api('/imported-matches/sync/' + integrationId, { method: 'POST' });
    fetchData();
  }

  async function triggerAnalysis(importedMatchId: string) {
    await api('/analysis-jobs', {
      method: 'POST',
      body: JSON.stringify({ importedMatchId }),
    });
    fetchData();
  }

  async function cancelJob(jobId: string) {
    await api(`/analysis-jobs/${jobId}`, { method: 'DELETE' });
    fetchData();
  }

  async function retryJob(job: AnalysisJob) {
    await api('/analysis-jobs', {
      method: 'POST',
      body: JSON.stringify({
        videoId: job.videoId ?? undefined,
        importedMatchId: job.importedMatchId ?? undefined,
      }),
    });
    fetchData();
  }

  return (
    <DashboardShell requireRole="player">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">My Videos &amp; Analysis</h1>
          <p className="text-muted-foreground">
            Connect video platforms, import matches, and run AI analysis.
          </p>
        </div>

        {/* ---------- Connected Platforms ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex flex-wrap gap-4">
                {PLATFORMS.map((p) => {
                  const integration = integrations.find(
                    (i) => i.platform === p.key,
                  );
                  const connected = connectedPlatforms.has(p.key);

                  return (
                    <div
                      key={p.key}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <span className="font-medium">{p.label}</span>
                      {connected && integration ? (
                        <>
                          {statusBadge(integration.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              api(`/video-integrations/${integration.id}`, {
                                method: 'DELETE',
                              }).then(fetchData)
                            }
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : p.available ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/api/video-integrations/veo/connect`)
                          }
                        >
                          Connect
                        </Button>
                      ) : (
                        <Badge variant="outline">Coming soon</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------- Imported Matches ---------- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Matches</CardTitle>
            {integrations
              .filter((i) => i.status === 'active')
              .map((i) => (
                <Button
                  key={i.id}
                  variant="outline"
                  size="sm"
                  onClick={() => syncMatches(i.id)}
                >
                  Sync {i.platform.toUpperCase()} Matches
                </Button>
              ))}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : matches.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No matches imported yet. Connect a platform and sync your
                matches.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => {
                  const matchJob = jobs.find(
                    (j) => j.importedMatchId === m.id,
                  );
                  const analyzed =
                    matchJob?.status === 'completed';
                  const inProgress =
                    matchJob &&
                    !['completed', 'failed'].includes(matchJob.status);

                  return (
                    <Card key={m.id}>
                      <CardContent className="space-y-2 p-4">
                        {m.platformThumbnailUrl && (
                          <img
                            src={m.platformThumbnailUrl}
                            alt={m.matchTitle ?? 'Match'}
                            className="h-32 w-full rounded object-cover"
                          />
                        )}
                        <p className="font-semibold">
                          {m.matchTitle ?? `${m.homeTeam ?? '?'} vs ${m.awayTeam ?? '?'}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.matchDate ?? '—'}{' '}
                          {m.durationSec
                            ? `· ${Math.round(m.durationSec / 60)} min`
                            : ''}
                        </p>
                        {analyzed ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/reports/${matchJob!.scoutingReportId ?? matchJob!.id}`}>
                              View Report
                            </Link>
                          </Button>
                        ) : inProgress ? (
                          <div className="space-y-1">
                            <Progress value={matchJob!.progressPct} />
                            <p className="text-xs text-muted-foreground">
                              {matchJob!.currentStage ?? matchJob!.status} — {matchJob!.progressPct}%
                            </p>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => triggerAnalysis(m.id)}
                          >
                            Analyze
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------- Upload ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" disabled>
                Upload Video (MP4, MOV — max 2 GB)
              </Button>
              <span className="text-sm text-muted-foreground">
                Direct upload coming in a future update.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Analysis Jobs ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : jobs.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No analysis jobs yet. Import a match and click Analyze.
              </p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        Job {job.id.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created{' '}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-1">{jobStatusDisplay(job)}</div>
                    <div className="flex gap-2">
                      {job.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryJob(job)}
                        >
                          Retry
                        </Button>
                      )}
                      {!['completed', 'failed'].includes(job.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelJob(job.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
