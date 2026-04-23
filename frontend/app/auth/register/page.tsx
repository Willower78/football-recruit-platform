'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, Users } from 'lucide-react';
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
import { useAuth } from '@/components/auth-provider';

type Role = 'player' | 'club';

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
    full_name: z.string().optional(),
    club_name: z.string().optional(),
    accept_terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Terms of Service' }),
    }),
    accept_privacy: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Privacy Policy' }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get('role');
  const { register: registerUser } = useAuth();
  const [role, setRole] = useState<Role | null>(
    initialRole === 'player' || initialRole === 'club' ? initialRole : null,
  );
  const [step, setStep] = useState<1 | 2>(role ? 2 : 1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (role) setStep(2);
  }, [role]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!role) return;
    setSubmitError(null);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        role,
        full_name: values.full_name,
        club_name: values.club_name,
        accept_terms: values.accept_terms,
        accept_privacy: values.accept_privacy,
      });
      router.push(
        role === 'player' ? '/onboarding/player' : '/onboarding/club',
      );
    } catch (err) {
      setSubmitError('Registration failed. Email may already be in use.');
    }
  };

  if (step === 1 || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-center text-3xl font-semibold">
            Create your account
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            Choose how you want to use Football Recruit.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole('player')}
              className="rounded-lg border-2 border-slate-200 bg-white p-10 text-left transition hover:border-primary"
            >
              <Users className="mb-3 h-10 w-10 text-slate-700" />
              <div className="text-xl font-semibold">I&apos;m a Player</div>
              <p className="mt-2 text-sm text-slate-600">
                Build a profile, share videos, and connect with clubs looking
                for talent.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setRole('club')}
              className="rounded-lg border-2 border-slate-200 bg-white p-10 text-left transition hover:border-primary"
            >
              <BadgeCheck className="mb-3 h-10 w-10 text-slate-700" />
              <div className="text-xl font-semibold">I&apos;m a Club</div>
              <p className="mt-2 text-sm text-slate-600">
                Post recruitment needs and search verified players by position
                and skillset.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            Register as a {role === 'player' ? 'Player' : 'Club'}
          </CardTitle>
          <CardDescription>
            <button
              className="text-primary hover:underline"
              type="button"
              onClick={() => setRole(null)}
            >
              Change role
            </button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                {...register('confirm_password')}
              />
              {errors.confirm_password && (
                <p className="text-sm text-destructive">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
            {role === 'player' ? (
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" {...register('full_name')} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="club_name">Club name</Label>
                <Input id="club_name" {...register('club_name')} />
              </div>
            )}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register('accept_terms')}
                />
                <span>
                  I accept the{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  .
                </span>
              </label>
              {errors.accept_terms && (
                <p className="text-sm text-destructive">
                  {errors.accept_terms.message as string}
                </p>
              )}
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register('accept_privacy')}
                />
                <span>
                  I accept the{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.accept_privacy && (
                <p className="text-sm text-destructive">
                  {errors.accept_privacy.message as string}
                </p>
              )}
            </div>
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
