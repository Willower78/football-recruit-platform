'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { VerificationBadge } from '@/components/verification-badge';
import { api } from '@/lib/api';

type Mode = 'players' | 'clubs';

interface PlayerItem {
  id: string;
  fullName: string | null;
  primaryPosition: string | null;
  city: string | null;
  country: string | null;
  freeAgent: boolean;
}

interface ClubItem {
  id: string;
  clubName: string | null;
  city: string | null;
  country: string | null;
  competitionLevel: string | null;
  verified: boolean;
  verificationTier?: string;
}

export default function SearchPage() {
  const [mode, setMode] = useState<Mode>('players');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(PlayerItem | ClubItem)[]>([]);
  const [filters, setFilters] = useState({ q: '', position: '', country: '' });

  async function run(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.country) params.set('country', filters.country);
      if (mode === 'players' && filters.position) params.set('position', filters.position);

      const path = mode === 'players' ? `/players?${params}` : `/clubs?${params}`;
      const res = await api<{ items: (PlayerItem | ClubItem)[] }>(path, { skipAuth: true });
      setResults(res.items ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container grid gap-6 py-10 lg:grid-cols-[280px_1fr]">
        <aside>
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex gap-2">
                <Button
                  variant={mode === 'players' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('players')}
                >
                  Players
                </Button>
                <Button
                  variant={mode === 'clubs' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('clubs')}
                >
                  Clubs
                </Button>
              </div>

              <form onSubmit={run} className="space-y-3">
                {mode === 'players' && (
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={filters.position}
                      onChange={(e) => setFilters((f) => ({ ...f, position: e.target.value }))}
                    >
                      <option value="">Any</option>
                      {['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={filters.country}
                    onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full">Search</Button>
              </form>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Search {mode}</h1>
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                Adjust your filters and press Search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((r) =>
                mode === 'players' ? (
                  <PlayerCard key={r.id} player={r as PlayerItem} />
                ) : (
                  <ClubCard key={r.id} club={r as ClubItem} />
                ),
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function PlayerCard({ player }: { player: PlayerItem }) {
  return (
    <Link href={`/players/${player.id}`}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="space-y-2 p-4">
          <p className="font-semibold">{player.fullName ?? 'Player'}</p>
          <p className="text-sm text-muted-foreground">
            {player.primaryPosition ?? '—'} · {[player.city, player.country].filter(Boolean).join(', ')}
          </p>
          {player.freeAgent && <Badge variant="secondary">Free agent</Badge>}
        </CardContent>
      </Card>
    </Link>
  );
}

function ClubCard({ club }: { club: ClubItem }) {
  return (
    <Link href={`/clubs/${club.id}`}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{club.clubName ?? 'Club'}</p>
            <VerificationBadge tier={(club.verificationTier as 'unverified' | 'verified' | 'official') ?? 'unverified'} />
          </div>
          <p className="text-sm text-muted-foreground">
            {[club.city, club.country].filter(Boolean).join(', ')}
            {club.competitionLevel ? ` · ${club.competitionLevel}` : ''}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
