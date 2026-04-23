'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Array<'player' | 'club' | 'scout' | 'admin'>;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/');
    }
  }, [loading, user, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }
  return <>{children}</>;
}
