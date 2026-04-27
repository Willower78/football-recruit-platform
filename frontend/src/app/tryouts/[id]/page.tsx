'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface TryoutDetail {
  id: string;
  title: string;
  description: string | null;
  sport: string;
  position: string | null;
  ageGroup: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  tryoutDate: string | null;
  endDate: string | null;
  maxParticipants: number | null;
  requirements: string | null;
  status: string;
  createdAt: string;
  club: {
    id: string;
    clubName: string | null;
    city: string | null;
    country: string | null;
  };
}

export default function TryoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tryout, setTryout] = useState<TryoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    api<TryoutDetail>(`/tryouts/${params.id}`, { skipAuth: true })
      .then((data) => setTryout(data))
      .catch(() => setTryout(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleApply() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setApplying(true);
    setError('');
    try {
      await api(`/tryouts/${params.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ message: message || undefined }),
      });
      setApplied(true);
      setShowForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply';
      setError(msg);
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="container py-10">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="h-64" />
        </main>
      </>
    );
  }

  if (!tryout) {
    return (
      <>
        <SiteHeader />
        <main className="container py-10 text-center">
          <h1 className="text-2xl font-semibold">Tryout not found</h1>
          <Link href="/tryouts" className="mt-4 inline-block text-primary underline">
            Back to tryouts
          </Link>
        </main>
      </>
    );
  }

  const dateStr = tryout.tryoutDate
    ? new Date(tryout.tryoutDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const endStr = tryout.endDate
    ? new Date(tryout.endDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const isClubOwner = user?.role === 'club';

  return (
    <>
      <SiteHeader />
      <main className="container max-w-3xl py-10">
        <Link
          href="/tryouts"
          className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to tryouts
        </Link>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{tryout.title}</h1>
                {tryout.club && (
                  <p className="mt-1 text-muted-foreground">
                    by {tryout.club.clubName ?? 'Unknown club'}
                    {tryout.club.city && ` · ${tryout.club.city}`}
                    {tryout.club.country && `, ${tryout.club.country}`}
                  </p>
                )}
              </div>
              <Badge variant={tryout.status === 'open' ? 'default' : 'secondary'}>
                {tryout.status}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {dateStr && (
                <InfoRow label="Date" value={dateStr} />
              )}
              {endStr && (
                <InfoRow label="End date" value={endStr} />
              )}
              {tryout.location && (
                <InfoRow label="Location" value={tryout.location} />
              )}
              {(tryout.city || tryout.country) && (
                <InfoRow
                  label="City / Country"
                  value={[tryout.city, tryout.country].filter(Boolean).join(', ')}
                />
              )}
              {tryout.position && (
                <InfoRow label="Position" value={tryout.position} />
              )}
              {tryout.ageGroup && (
                <InfoRow label="Age group" value={tryout.ageGroup} />
              )}
              {tryout.sport && (
                <InfoRow label="Sport" value={tryout.sport} />
              )}
              {tryout.maxParticipants && (
                <InfoRow
                  label="Max participants"
                  value={String(tryout.maxParticipants)}
                />
              )}
            </div>

            {tryout.description && (
              <div>
                <h2 className="mb-2 font-semibold">Description</h2>
                <p className="whitespace-pre-wrap text-sm">{tryout.description}</p>
              </div>
            )}

            {tryout.requirements && (
              <div>
                <h2 className="mb-2 font-semibold">Requirements</h2>
                <p className="whitespace-pre-wrap text-sm">{tryout.requirements}</p>
              </div>
            )}

            {tryout.status === 'open' && !isClubOwner && (
              <div className="border-t pt-4">
                {applied ? (
                  <p className="font-medium text-green-600">
                    You have applied to this tryout!
                  </p>
                ) : showForm ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Message (optional)</Label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Introduce yourself, your experience, why you'd be a good fit..."
                        rows={4}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex gap-2">
                      <Button onClick={handleApply} disabled={applying}>
                        {applying ? 'Submitting...' : 'Submit application'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => (user ? setShowForm(true) : router.push('/auth/login'))}>
                    Apply to this tryout
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
