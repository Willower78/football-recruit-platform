'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface MyApplication {
  id: string;
  tryoutId: string;
  message: string | null;
  status: string;
  createdAt: string;
  tryout: {
    id: string;
    title: string;
    tryoutDate: string | null;
    city: string | null;
    country: string | null;
    status: string;
    club: {
      id: string;
      clubName: string | null;
    };
  };
}

export default function PlayerApplicationsPage() {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const data = await api<MyApplication[]>('/tryouts/me/applications');
      setApplications(data);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  async function withdraw(tryoutId: string) {
    try {
      await api(`/tryouts/${tryoutId}/apply`, { method: 'DELETE' });
      loadApplications();
    } catch {
      // silently fail
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      case 'withdrawn':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <DashboardShell requireRole="player">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Tryout Applications</h1>
          <Button asChild variant="outline">
            <Link href="/tryouts">Browse tryouts</Link>
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              You haven&apos;t applied to any tryouts yet.{' '}
              <Link href="/tryouts" className="text-primary underline">
                Browse tryouts
              </Link>{' '}
              to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/tryouts/${a.tryout.id}`}
                      className="font-medium hover:underline"
                    >
                      {a.tryout.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {a.tryout.club?.clubName ?? 'Unknown club'}
                      {a.tryout.city && ` · ${a.tryout.city}`}
                      {a.tryout.country && `, ${a.tryout.country}`}
                    </p>
                    {a.tryout.tryoutDate && (
                      <p className="text-xs text-muted-foreground">
                        Tryout:{' '}
                        {new Date(a.tryout.tryoutDate).toLocaleDateString(
                          'en-GB',
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Applied{' '}
                      {new Date(a.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(a.status)}>{a.status}</Badge>
                    {a.status === 'applied' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => withdraw(a.tryoutId)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
