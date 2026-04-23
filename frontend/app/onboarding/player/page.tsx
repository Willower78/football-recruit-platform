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

const POSITIONS = [
  'GK',
  'CB',
  'LB',
  'RB',
  'CDM',
  'CM',
  'CAM',
  'LW',
  'RW',
  'ST',
  'CF',
];

interface PlayerFormState {
  full_name: string;
  date_of_birth: string;
  nationality: string;
  city: string;
  country: string;
  primary_position: string;
  secondary_positions: string[];
  dominant_foot: 'left' | 'right' | 'both' | '';
  height_cm: string;
  weight_kg: string;
  current_club: string;
  free_agent: boolean;
  availability_status: string;
  competition_level: string;
  bio: string;
}

const EMPTY: PlayerFormState = {
  full_name: '',
  date_of_birth: '',
  nationality: '',
  city: '',
  country: '',
  primary_position: '',
  secondary_positions: [],
  dominant_foot: '',
  height_cm: '',
  weight_kg: '',
  current_club: '',
  free_agent: true,
  availability_status: 'available',
  competition_level: '',
  bio: '',
};

function PlayerOnboardingInner() {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PlayerFormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  const update = <K extends keyof PlayerFormState>(
    key: K,
    value: PlayerFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSecondary = (pos: string) => {
    setForm((prev) => ({
      ...prev,
      secondary_positions: prev.secondary_positions.includes(pos)
        ? prev.secondary_positions.filter((p) => p !== pos)
        : [...prev.secondary_positions, pos],
    }));
  };

  const submit = async () => {
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        full_name: form.full_name || undefined,
        date_of_birth: form.date_of_birth || undefined,
        nationality: form.nationality || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        primary_position: form.primary_position || undefined,
        secondary_positions:
          form.secondary_positions.length > 0
            ? form.secondary_positions
            : undefined,
        dominant_foot: form.dominant_foot || undefined,
        height_cm: form.height_cm ? Number(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
        current_club: form.current_club || undefined,
        free_agent: form.free_agent,
        availability_status: form.availability_status || undefined,
        competition_level: form.competition_level || undefined,
        bio: form.bio || undefined,
      };
      await api('/players/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
        token: accessToken,
      });
      router.push('/dashboard/player');
    } catch {
      setError('Could not save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Step {step} of 4</p>
          <Progress value={progress} className="mt-2" />
        </div>
        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Basic info</CardTitle>
                <CardDescription>
                  Tell us who you are. This shows on your public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    value={form.full_name || user?.email || ''}
                    onChange={(e) => update('full_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => update('date_of_birth', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={form.nationality}
                      onChange={(e) => update('nationality', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                </div>
              </CardContent>
            </>
          )}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Football info</CardTitle>
                <CardDescription>
                  Your positions, preferred foot and physical attributes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary position</Label>
                  <Select
                    value={form.primary_position}
                    onValueChange={(v) => update('primary_position', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Secondary positions</Label>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map((p) => {
                      const active = form.secondary_positions.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleSecondary(p)}
                          className={`rounded-full border px-3 py-1 text-sm transition ${
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-primary/50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dominant foot</Label>
                  <div className="flex gap-3">
                    {(['left', 'right', 'both'] as const).map((f) => (
                      <label
                        key={f}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="dominant_foot"
                          value={f}
                          checked={form.dominant_foot === f}
                          onChange={() => update('dominant_foot', f)}
                        />
                        <span className="capitalize">{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      value={form.height_cm}
                      onChange={(e) => update('height_cm', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      value={form.weight_kg}
                      onChange={(e) => update('weight_kg', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Current status</CardTitle>
                <CardDescription>
                  Club situation and availability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_club">Current club</Label>
                  <Input
                    id="current_club"
                    value={form.current_club}
                    onChange={(e) => update('current_club', e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.free_agent}
                    onChange={(e) => update('free_agent', e.target.checked)}
                  />
                  <span>I am currently a free agent</span>
                </label>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    value={form.availability_status}
                    onValueChange={(v) => update('availability_status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="not_available">Not available</SelectItem>
                      <SelectItem value="open_to_offers">
                        Open to offers
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Competition level</Label>
                  <Select
                    value={form.competition_level}
                    onValueChange={(v) => update('competition_level', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select competition level" />
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
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>About you</CardTitle>
                <CardDescription>
                  A short bio helps clubs understand your story. Max 500 chars.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="min-h-[160px] w-full rounded-md border border-input bg-background p-3 text-sm"
                  maxLength={500}
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  placeholder="What should clubs know about you?"
                />
                <p className="text-right text-xs text-muted-foreground">
                  {form.bio.length}/500
                </p>
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
            {step < 4 ? (
              <Button onClick={() => setStep((s) => Math.min(4, s + 1))}>
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

export default function PlayerOnboardingPage() {
  return (
    <ProtectedRoute allowedRoles={['player']}>
      <PlayerOnboardingInner />
    </ProtectedRoute>
  );
}
