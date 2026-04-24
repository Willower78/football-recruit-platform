'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

/* ---------- types ---------- */
interface ScoutingReport {
  id: string;
  playerId: string;
  videoId: string | null;
  generatedBy: string;
  scores: Record<string, number | null>;
  strengths: string[];
  weaknesses: string[];
  summaryText: string | null;
  status: string;
  createdAt: string;
}

interface TrackedEvent {
  id: string;
  timestampSec: number;
  eventType: string;
  coordinates: Record<string, number> | null;
  confidence: number | null;
}

interface Highlight {
  id: string;
  title: string;
  eventType: string;
  startTimeSec: number;
  endTimeSec: number;
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

/* ---------- constants ---------- */
const DOMAINS = [
  { name: 'Technical', categories: ['First Touch & Composure', 'Passing Accuracy & Range', 'Dribbling & Ball Carrying', 'Shooting & Finishing'] },
  { name: 'Physical', categories: ['Speed & Agility', 'Strength & Stamina'] },
  { name: 'Tactical', categories: ['Off-Ball Movement', 'Decision-Making', 'Tactical Understanding'] },
  { name: 'Mental', categories: ['Game Reading', 'Mentality'] },
  { name: 'Intangibles', categories: ['Position-Specific Technique', 'Body Language'] },
];

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ---------- page ---------- */
export default function ScoutingReportPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [playingClip, setPlayingClip] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // The report ID is passed but we don't yet have a dedicated endpoint to
    // fetch a single scouting report with all relations. Show a placeholder.
    setLoading(false);
  }, [params.id]);

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-destructive">{error}</CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">Scouting Report</h1>
              <p className="text-muted-foreground">
                Report ID: {params.id.slice(0, 8)}…
              </p>
            </div>

            {/* --- Video Player Placeholder --- */}
            <Card>
              <CardHeader>
                <CardTitle>Match Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center rounded bg-muted text-muted-foreground">
                  Video player will load when match footage is available.
                </div>
              </CardContent>
            </Card>

            {/* --- Event Timeline --- */}
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Event markers will appear here after AI analysis completes.
                  Click any event to jump to that timestamp in the video.
                </p>
              </CardContent>
            </Card>

            {/* --- Scouting Ratings --- */}
            <Card>
              <CardHeader>
                <CardTitle>Scouting Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {report ? (
                  <div className="space-y-6">
                    {DOMAINS.map((domain) => (
                      <div key={domain.name}>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          {domain.name}
                        </h3>
                        <div className="space-y-2">
                          {domain.categories.map((cat) => {
                            const score = report.scores[cat];
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
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Ratings will populate after AI analysis completes.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* --- Strengths & Weaknesses --- */}
            {report && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.strengths.length > 0 ? (
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {report.strengths.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">—</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Areas to Improve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.weaknesses.length > 0 ? (
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {report.weaknesses.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">—</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* --- Summary --- */}
            {report?.summaryText && (
              <Card>
                <CardHeader>
                  <CardTitle>Role-Fit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{report.summaryText}</p>
                  {report.status === 'draft' && (
                    <Badge variant="outline" className="mt-3">
                      Needs Human Review
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* --- Highlights Carousel --- */}
            <Card>
              <CardHeader>
                <CardTitle>Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                {highlights.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Highlight clips will appear here after AI analysis.
                  </p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {highlights.map((h) => (
                      <div
                        key={h.id}
                        className="min-w-[200px] rounded-lg border p-3"
                      >
                        {playingClip === h.id && h.clipStorageUrl ? (
                          <video
                            src={h.clipStorageUrl}
                            controls
                            autoPlay
                            className="h-28 w-full rounded object-cover"
                            onEnded={() => setPlayingClip(null)}
                          />
                        ) : (
                          <div
                            className="relative flex h-28 cursor-pointer items-center justify-center rounded bg-muted"
                            onClick={() => setPlayingClip(h.id)}
                          >
                            {h.thumbnailUrl ? (
                              <img
                                src={h.thumbnailUrl}
                                alt={h.title}
                                className="h-full w-full rounded object-cover"
                              />
                            ) : (
                              <span className="text-2xl">&#9654;</span>
                            )}
                          </div>
                        )}
                        <p className="mt-1 text-sm font-medium">{h.title}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">
                            {h.eventType.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(h.startTimeSec)} – {formatTime(h.endTimeSec)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* --- Scout Notes --- */}
            <Card>
              <CardHeader>
                <CardTitle>Scout Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Scouts and admins can add notes here (coming soon).
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
