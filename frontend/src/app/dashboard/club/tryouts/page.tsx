'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface MyTryout {
  id: string;
  title: string;
  status: string;
  tryoutDate: string | null;
  position: string | null;
  city: string | null;
  createdAt: string;
}

interface TryoutApp {
  id: string;
  playerId: string;
  message: string | null;
  status: string;
  createdAt: string;
  player: { id: string; email: string };
}

export default function ClubTryoutsPage() {
  const [myTryouts, setMyTryouts] = useState<MyTryout[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState<string | null>(null);
  const [applications, setApplications] = useState<TryoutApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    loadTryouts();
  }, []);

  async function loadTryouts() {
    try {
      const data = await api<MyTryout[]>('/tryouts/me/created');
      setMyTryouts(data);
    } catch {
      setMyTryouts([]);
    }
  }

  async function viewApplications(tryoutId: string) {
    setSelectedTryout(tryoutId);
    setLoadingApps(true);
    try {
      const data = await api<TryoutApp[]>(`/tryouts/${tryoutId}/applications`);
      setApplications(data);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }

  async function updateStatus(appId: string, status: 'accepted' | 'rejected') {
    try {
      await api(`/tryouts/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (selectedTryout) viewApplications(selectedTryout);
    } catch {
      // silently fail
    }
  }

  async function closeTryout(tryoutId: string) {
    try {
      await api(`/tryouts/${tryoutId}/close`, { method: 'PATCH' });
      loadTryouts();
    } catch {
      // silently fail
    }
  }

  return (
    <DashboardShell requireRole="club">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Manage Tryouts</h1>
          <Button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : 'Create tryout'}
          </Button>
        </div>

        {showCreate && (
          <CreateTryoutForm
            onCreated={() => {
              setShowCreate(false);
              loadTryouts();
            }}
          />
        )}

        {myTryouts.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              You haven&apos;t created any tryouts yet. Click &quot;Create tryout&quot; to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myTryouts.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/tryouts/${t.id}`}
                      className="font-medium hover:underline"
                    >
                      {t.title}
                    </Link>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {t.position && <span>{t.position}</span>}
                      {t.city && <span>· {t.city}</span>}
                      {t.tryoutDate && (
                        <span>
                          ·{' '}
                          {new Date(t.tryoutDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={t.status === 'open' ? 'default' : 'secondary'}
                    >
                      {t.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewApplications(t.id)}
                    >
                      Applications
                    </Button>
                    {t.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => closeTryout(t.id)}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTryout && (
          <Card>
            <CardHeader>
              <CardTitle>
                Applications for:{' '}
                {myTryouts.find((t) => t.id === selectedTryout)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApps ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : applications.length === 0 ? (
                <p className="text-muted-foreground">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-4 rounded-md border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.player.email}</p>
                        {a.message && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {a.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Applied{' '}
                          {new Date(a.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            a.status === 'accepted'
                              ? 'default'
                              : a.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {a.status}
                        </Badge>
                        {a.status === 'applied' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(a.id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(a.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

function CreateTryoutForm({ onCreated }: { onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    position: '',
    ageGroup: '',
    location: '',
    city: '',
    country: '',
    tryoutDate: '',
    endDate: '',
    maxParticipants: '',
    requirements: '',
  });

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api('/tryouts', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          position: form.position || undefined,
          ageGroup: form.ageGroup || undefined,
          location: form.location || undefined,
          city: form.city || undefined,
          country: form.country || undefined,
          tryoutDate: form.tryoutDate || undefined,
          endDate: form.endDate || undefined,
          maxParticipants: form.maxParticipants
            ? Number(form.maxParticipants)
            : undefined,
          requirements: form.requirements || undefined,
        }),
      });
      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create tryout';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new tryout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. U18 Striker Tryout — Spring 2025"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Tell athletes what to expect..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={form.position}
              onChange={(e) => setField('position', e.target.value)}
            >
              <option value="">Any</option>
              {['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'].map(
                (p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ),
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Age group</Label>
            <Input
              value={form.ageGroup}
              onChange={(e) => setField('ageGroup', e.target.value)}
              placeholder="e.g. U18, Senior, Open"
            />
          </div>

          <div className="space-y-2">
            <Label>Location / Venue</Label>
            <Input
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="e.g. Emirates Stadium"
            />
          </div>

          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              placeholder="e.g. London"
            />
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={form.country}
              onChange={(e) => setField('country', e.target.value)}
              placeholder="e.g. England"
            />
          </div>

          <div className="space-y-2">
            <Label>Tryout date</Label>
            <Input
              type="datetime-local"
              value={form.tryoutDate}
              onChange={(e) => setField('tryoutDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>End date</Label>
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setField('endDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Max participants</Label>
            <Input
              type="number"
              min="1"
              value={form.maxParticipants}
              onChange={(e) => setField('maxParticipants', e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Requirements</Label>
            <Textarea
              value={form.requirements}
              onChange={(e) => setField('requirements', e.target.value)}
              placeholder="Any requirements athletes should know about..."
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 sm:col-span-2">{error}</p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create tryout'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
