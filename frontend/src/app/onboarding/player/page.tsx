'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const positions = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
const levels = ['grassroots', 'academy', 'semi_pro', 'professional'];
const availabilityOptions = [
  { value: 'available', label: 'Actively looking' },
  { value: 'open_to_offers', label: 'Open to offers' },
  { value: 'not_available', label: 'Not currently available' },
];

export default function PlayerOnboardingPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    city: '',
    country: '',
    primaryPosition: 'CM',
    secondaryPositions: [] as string[],
    dominantFoot: 'right' as 'left' | 'right' | 'both',
    heightCm: '' as number | '',
    weightKg: '' as number | '',
    currentClub: '',
    freeAgent: true,
    availabilityStatus: 'available' as 'available' | 'open_to_offers' | 'not_available',
    competitionLevel: 'grassroots',
    bio: '',
  });

  const totalSteps = 4;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFinish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api('/players/me', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth || undefined,
          nationality: form.nationality,
          city: form.city,
          country: form.country,
          primaryPosition: form.primaryPosition,
          secondaryPositions: form.secondaryPositions,
          dominantFoot: form.dominantFoot,
          heightCm: form.heightCm === '' ? undefined : Number(form.heightCm),
          weightKg: form.weightKg === '' ? undefined : Number(form.weightKg),
          currentClub: form.currentClub,
          freeAgent: form.freeAgent,
          availabilityStatus: form.availabilityStatus,
          bio: form.bio,
        }),
      });
      await refresh();
      router.push('/dashboard/player');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3">
          <CardTitle>Player onboarding</CardTitle>
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">Step {step + 1} of {totalSteps}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onFinish} className="space-y-4">
            {step === 0 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Primary position</Label>
                  <Select value={form.primaryPosition} onChange={(e) => update('primaryPosition', e.target.value)}>
                    {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Secondary positions (comma separated)</Label>
                  <Input
                    value={form.secondaryPositions.join(', ')}
                    onChange={(e) => update('secondaryPositions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dominant foot</Label>
                  <Select value={form.dominantFoot} onChange={(e) => update('dominantFoot', e.target.value as 'left' | 'right' | 'both')}>
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="both">Both</option>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      value={form.heightCm}
                      onChange={(e) => update('heightCm', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={form.weightKg}
                      onChange={(e) => update('weightKg', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Current club</Label>
                  <Input value={form.currentClub} onChange={(e) => update('currentClub', e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.freeAgent}
                    onChange={(e) => update('freeAgent', e.target.checked)}
                  />
                  I&apos;m a free agent
                </label>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    value={form.availabilityStatus}
                    onChange={(e) => update('availabilityStatus', e.target.value as 'available' | 'open_to_offers' | 'not_available')}
                  >
                    {availabilityOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Competition level</Label>
                  <Select value={form.competitionLevel} onChange={(e) => update('competitionLevel', e.target.value)}>
                    {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  rows={6}
                  placeholder="Tell clubs about your style, strengths, ambitions…"
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < totalSteps - 1 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Finish'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
