'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth, type AuthUser } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

interface NavItem {
  href: string;
  label: string;
}

function navItemsFor(role: AuthUser['role']): NavItem[] {
  switch (role) {
    case 'player':
      return [
        { href: '/dashboard/player', label: 'Overview' },
        { href: '/feed', label: 'Feed' },
        { href: '/search', label: 'Discover clubs' },
      ];
    case 'club':
      return [
        { href: '/dashboard/club', label: 'Overview' },
        { href: '/feed', label: 'Feed' },
        { href: '/search', label: 'Discover players' },
      ];
    case 'admin':
      return [
        { href: '/dashboard/admin', label: 'Overview' },
        { href: '/feed', label: 'Feed' },
        { href: '/search', label: 'Search' },
      ];
    default:
      return [{ href: '/search', label: 'Search' }];
  }
}

export function DashboardShell({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: AuthUser['role'];
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (requireRole && user.role !== requireRole && user.role !== 'admin') {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, loading, requireRole, router]);

  if (loading || !user) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const items = navItemsFor(user.role);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-muted/30 p-4 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 font-semibold">
          <img src="/logo.png" alt="Apex Draft" className="h-7 w-auto" />
          Apex Draft
        </Link>
        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 space-y-1 text-sm text-muted-foreground">
          <p className="truncate">{user.email}</p>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </aside>
      <main className="flex-1">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}
