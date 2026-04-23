'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Progress } from '@/components/ui/progress';

type Step = 'role' | 'details' | 'terms';

function RegisterInner() {
  const { register } = useAuth();
  const router = useRouter();
  const search = useSearchParams();

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<'player' | 'club' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = search.get('role');
    if (roleParam === 'player' || roleParam === 'club') {
      setRole(roleParam);
      setStep('details');
    }
  }, [search]);

  const progress = step === 'role' ? 33 : step === 'details' ? 66 : 100;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setSubmitting(true);
    try {
      const user = await register({ role, email, password, name, acceptTerms });
      router.push(`/onboarding/${user.role}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3">
        <CardTitle>Create your account</CardTitle>
        <Progress value={progress} />
      </CardHeader>
      <CardContent>
        {step === 'role' && (
          <div className="grid gap-3">
            <Button
              variant={role === 'player' ? 'default' : 'outline'}
              size="lg"
              onClick={() => {
                setRole('player');
                setStep('details');
              }}
            >
              I&apos;m a player
            </Button>
            <Button
              variant={role === 'club' ? 'default' : 'outline'}
              size="lg"
              onClick={() => {
                setRole('club');
                setStep('details');
              }}
            >
              I&apos;m a club
            </Button>
          </div>
        )}

        {step === 'details' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep('terms');
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">{role === 'club' ? 'Club name' : 'Full name'}</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep('role')}>
                Back
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        )}

        {step === 'terms' && (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1"
              />
              <span>
                I agree to the Terms of Service and acknowledge the Privacy Policy. I understand
                my data is processed to match me with relevant clubs / players.
              </span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button type="submit" disabled={submitting || !acceptTerms}>
                {submitting ? 'Creating…' : 'Create account'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
        <RegisterInner />
      </Suspense>
    </main>
  );
}
