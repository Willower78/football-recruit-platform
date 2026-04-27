'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface TryoutClub {
  id: string;
  clubName: string | null;
  city: string | null;
  country: string | null;
}

interface TryoutItem {
  id: string;
  title: string;
  description: string | null;
  sport: string;
  position: string | null;
  ageGroup: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  tryoutDate: string | null;
  endDate: string | null;
  maxParticipants: number | null;
  requirements: string | null;
  status: string;
  createdAt: string;
  club: TryoutClub | null;
}

export default function TryoutsPage() {
  const [loading, setLoading] = useState(false);
  const [tryouts, setTryouts] = useState<TryoutItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    sport: '',
    position: '',
    city: '',
    country: '',
  });

  async function search(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sport) params.set('sport', filters.sport);
      if (filters.position) params.set('position', filters.position);
      if (filters.city) params.set('city', filters.city);
      if (filters.country) params.set('country', filters.country);

      const res = await api<{ items: TryoutItem[]; total: number }>(
        `/tryouts?${params}`,
        { skipAuth: true },
      );
      setTryouts(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setTryouts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="container grid gap-6 py-10 lg:grid-cols-[280px_1fr]">
        <aside>
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <form onSubmit={search} className="space-y-3">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={filters.position}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, position: e.target.value }))
                    }
                  >
                    <option value="">Any</option>
                    {['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'].map(
                      (p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ),
                    )}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={filters.city}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="e.g. London"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={filters.country}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, country: e.target.value }))
                    }
                    placeholder="e.g. England"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Search tryouts
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Discover Tryouts</h1>
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {total} tryout{total !== 1 ? 's' : ''} found
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : tryouts.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No tryouts found. Adjust your filters and search again.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tryouts.map((t) => (
                <TryoutCard key={t.id} tryout={t} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function TryoutCard({ tryout }: { tryout: TryoutItem }) {
  const dateStr = tryout.tryoutDate
    ? new Date(tryout.tryoutDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Link href={`/tryouts/${tryout.id}`}>
      <Card className="h-full transition-colors hover:border-primary">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{tryout.title}</h3>
            {tryout.position && <Badge variant="secondary">{tryout.position}</Badge>}
          </div>

          {tryout.club && (
            <p className="text-sm text-muted-foreground">
              {tryout.club.clubName ?? 'Unknown club'}
              {tryout.club.city && ` · ${tryout.club.city}`}
              {tryout.club.country && `, ${tryout.club.country}`}
            </p>
          )}

          {tryout.description && (
            <p className="line-clamp-2 text-sm">{tryout.description}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {dateStr && <span>📅 {dateStr}</span>}
            {tryout.location && <span>📍 {tryout.location}</span>}
            {tryout.ageGroup && <span>🏷️ {tryout.ageGroup}</span>}
            {tryout.maxParticipants && (
              <span>👥 Max {tryout.maxParticipants}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
