'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AGE_GROUPS = [
  'U12',
  'U13',
  'U14',
  'U15',
  'U16',
  'U17',
  'U18',
  'U19',
  'U21',
  'U23',
  'Senior',
];

interface ClubFormState {
  club_name: string;
  country: string;
  city: string;
  league_name: string;
  competition_level: string;
  age_groups: string[];
  description: string;
  website_url: string;
}

const EMPTY: ClubFormState = {
  club_name: '',
  country: '',
  city: '',
  league_name: '',
  competition_level: '',
  age_groups: [],
  description: '',
  website_url: '',
};

function ClubOnboardingInner() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ClubFormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => (step / 2) * 100, [step]);

  const update = <K extends keyof ClubFormState>(
    key: K,
    value: ClubFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAgeGroup = (ag: string) => {
    setForm((prev) => ({
      ...prev,
      age_groups: prev.age_groups.includes(ag)
        ? prev.age_groups.filter((g) => g !== ag)
        : [...prev.age_groups, ag],
    }));
  };

  const submit = async () => {
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);
    try {
      await api('/clubs/me', {
        method: 'PATCH',
        body: JSON.stringify({
          club_name: form.club_name || undefined,
          country: form.country || undefined,
          city: form.city || undefined,
          league_name: form.league_name || undefined,
          competition_level: form.competition_level || undefined,
          age_groups:
            form.age_groups.length > 0 ? form.age_groups : undefined,
          description: form.description || undefined,
          website_url: form.website_url || undefined,
        }),
        token: accessToken,
      });
      router.push('/dashboard/club');
    } catch {
      setError('Could not save club profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Step {step} of 2</p>
          <Progress value={progress} className="mt-2" />
        </div>
        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Club details</CardTitle>
                <CardDescription>
                  The basics so players can find and recognize you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club_name">Club name</Label>
                  <Input
                    id="club_name"
                    value={form.club_name}
                    onChange={(e) => update('club_name', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="league_name">League</Label>
                  <Input
                    id="league_name"
                    value={form.league_name}
                    onChange={(e) => update('league_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Competition level</Label>
                  <Select
                    value={form.competition_level}
                    onValueChange={(v) => update('competition_level', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amateur">Amateur</SelectItem>
                      <SelectItem value="semi_pro">Semi-pro</SelectItem>
                      <SelectItem value="academy">Academy</SelectItem>
                      <SelectItem value="pro">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Programs and profile</CardTitle>
                <CardDescription>
                  Age groups you recruit for, plus a description and website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Age groups</Label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map((ag) => {
                      const active = form.age_groups.includes(ag);
                      return (
                        <button
                          key={ag}
                          type="button"
                          onClick={() => toggleAgeGroup(ag)}
                          className={`rounded-full border px-3 py-1 text-sm transition ${
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-primary/50'
                          }`}
                        >
                          {ag}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="min-h-[120px] w-full rounded-md border border-input bg-background p-3 text-sm"
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={form.website_url}
                    onChange={(e) => update('website_url', e.target.value)}
                    placeholder="https://"
                  />
                </div>
              </CardContent>
            </>
          )}
          {error && (
            <CardContent>
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          )}
          <CardContent className="flex justify-between gap-4 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep((s) => Math.min(2, s + 1))}>
                Next
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Complete profile'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ClubOnboardingPage() {
  return (
    <ProtectedRoute allowedRoles={['club']}>
      <ClubOnboardingInner />
    </ProtectedRoute>
  );
}
