'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface UnverifiedRec {
  id: string;
  coachName: string | null;
  coachEmail: string | null;
  coachRole: string | null;
  coachClub: string | null;
  coachOrganization: string | null;
  overallRating: number | null;
  strengthsText: string | null;
  playerId: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [unverified, setUnverified] = useState<UnverifiedRec[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    api<UnverifiedRec[]>('/admin/recommendations/unverified')
      .then(setUnverified)
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, []);

  async function handleVerify(id: string) {
    try {
      await api(`/admin/recommendations/${id}/verify`, { method: 'PATCH' });
      setUnverified((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // silent
    }
  }

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">
          Platform overview and moderation tools.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Users" value="—" />
          <StatCard title="Players" value="—" />
          <StatCard title="Clubs" value="—" />
        </div>

        {/* Recommendation verification */}
        <Card>
          <CardHeader>
            <CardTitle>Unverified Recommendations ({unverified.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingRecs ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : unverified.length === 0 ? (
              <p className="text-sm text-muted-foreground">All recommendations verified.</p>
            ) : (
              unverified.map((r) => {
                const emailDomain = r.coachEmail?.split('@')[1] ?? '';
                return (
                  <div key={r.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium">{r.coachName ?? 'Unknown coach'}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.coachRole ?? ''} {r.coachClub || r.coachOrganization ? `at ${r.coachClub ?? r.coachOrganization}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Email domain: <span className="font-mono">{emailDomain}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rating: {'★'.repeat(r.overallRating ?? 0)} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                      {r.strengthsText && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.strengthsText}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleVerify(r.id)}>
                        Verify
                      </Button>
                      <Button size="sm" variant="outline">
                        Flag
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/search">Search</Link></Button>
            <Button asChild variant="outline">
              <a href="/api/docs" target="_blank" rel="noreferrer">API docs</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
