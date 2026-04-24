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

const levels = ['grassroots', 'academy', 'semi_pro', 'professional'];

export default function ClubOnboardingPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    clubName: '',
    country: '',
    city: '',
    leagueName: '',
    competitionLevel: 'grassroots',
    ageGroups: [] as string[],
    description: '',
    websiteUrl: '',
  });

  const totalSteps = 2;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFinish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api('/clubs/me', {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      await refresh();
      router.push('/dashboard/club');
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
          <CardTitle>Club onboarding</CardTitle>
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">Step {step + 1} of {totalSteps}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onFinish} className="space-y-4">
            {step === 0 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Club name</Label>
                  <Input required value={form.clubName} onChange={(e) => update('clubName', e.target.value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>League</Label>
                  <Input value={form.leagueName} onChange={(e) => update('leagueName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Competition level</Label>
                  <Select value={form.competitionLevel} onChange={(e) => update('competitionLevel', e.target.value)}>
                    {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Age groups (comma separated, e.g. U15, U17, U19)</Label>
                  <Input
                    value={form.ageGroups.join(', ')}
                    onChange={(e) => update('ageGroups', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={form.websiteUrl}
                    onChange={(e) => update('websiteUrl', e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              {step < totalSteps - 1 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)}>Next</Button>
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
