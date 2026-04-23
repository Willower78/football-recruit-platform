'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { PublicHeader } from '@/components/public-header';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface PlayerCard {
  id: string;
  full_name: string | null;
  nationality: string | null;
  city: string | null;
  country: string | null;
  primary_position: string | null;
  availability_status: string | null;
  date_of_birth: string | null;
}

interface SearchResult {
  data: PlayerCard[];
  page: number;
  limit: number;
  total: number;
}

interface Filters {
  position: string;
  country: string;
  age_min: string;
  age_max: string;
  lat: string;
  lng: string;
  radius_km: string;
  dominant_foot: '' | 'left' | 'right' | 'both';
  free_agent: '' | 'true' | 'false';
  availability_status: string;
}

const EMPTY: Filters = {
  position: '',
  country: '',
  age_min: '',
  age_max: '',
  lat: '',
  lng: '',
  radius_km: '',
  dominant_foot: '',
  free_agent: '',
  availability_status: '',
};

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

function computeAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function SearchPage() {
  const { accessToken } = useAuth();
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      try {
        const query: Record<string, string | number | undefined> = {
          page: targetPage,
          limit: 20,
          position: filters.position || undefined,
          country: filters.country || undefined,
          age_min: filters.age_min || undefined,
          age_max: filters.age_max || undefined,
          dominant_foot: filters.dominant_foot || undefined,
          availability_status: filters.availability_status || undefined,
          free_agent: filters.free_agent || undefined,
          lat: filters.lat || undefined,
          lng: filters.lng || undefined,
          radius_km: filters.radius_km || undefined,
        };
        const res = await api<SearchResult>('/players', {
          query,
          token: accessToken ?? undefined,
        });
        setResult(res);
        setPage(targetPage);
      } finally {
        setLoading(false);
      }
    },
    [filters, accessToken],
  );

  useEffect(() => {
    load(1).catch(() => undefined);
  }, [load]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Search players</h1>
        <p className="mt-1 text-muted-foreground">
          Filter the talent pool by position, location and availability.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={filters.position}
                  onValueChange={(v) => update('position', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
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
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Age min</Label>
                  <Input
                    type="number"
                    value={filters.age_min}
                    onChange={(e) => update('age_min', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age max</Label>
                  <Input
                    type="number"
                    value={filters.age_max}
                    onChange={(e) => update('age_max', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={filters.country}
                  onChange={(e) => update('country', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lat / Lng</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Latitude"
                    value={filters.lat}
                    onChange={(e) => update('lat', e.target.value)}
                  />
                  <Input
                    placeholder="Longitude"
                    value={filters.lng}
                    onChange={(e) => update('lng', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Radius (km): {filters.radius_km || 50}
                </Label>
                <input
                  type="range"
                  min={1}
                  max={500}
                  value={filters.radius_km || 50}
                  onChange={(e) => update('radius_km', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Dominant foot</Label>
                <Select
                  value={filters.dominant_foot}
                  onValueChange={(v) =>
                    update('dominant_foot', v as Filters['dominant_foot'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Free agent</Label>
                <Select
                  value={filters.free_agent}
                  onValueChange={(v) =>
                    update('free_agent', v as Filters['free_agent'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Free agent</SelectItem>
                    <SelectItem value="false">Under contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={filters.availability_status}
                  onValueChange={(v) => update('availability_status', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="not_available">Not available</SelectItem>
                    <SelectItem value="open_to_offers">Open to offers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button onClick={() => load(1)} disabled={loading}>
                  {loading ? 'Searching…' : 'Apply filters'}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters(EMPTY);
                  }}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Clear
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : result && result.data.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {result.data.map((player) => (
                    <Link
                      key={player.id}
                      href={`/players/${player.id}`}
                      className="block"
                    >
                      <Card className="h-full transition hover:border-primary">
                        <CardContent className="flex flex-col gap-3 p-5">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {(player.full_name ?? '?')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {player.full_name ?? 'Unnamed player'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {[player.city, player.country]
                                  .filter(Boolean)
                                  .join(', ') || 'Unknown location'}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {player.primary_position && (
                              <Badge>{player.primary_position}</Badge>
                            )}
                            {(() => {
                              const age = computeAge(player.date_of_birth);
                              return age !== null ? (
                                <Badge variant="secondary">{age} yrs</Badge>
                              ) : null;
                            })()}
                            {player.nationality && (
                              <Badge variant="outline">
                                {player.nationality}
                              </Badge>
                            )}
                            {player.availability_status && (
                              <Badge variant="success">
                                {player.availability_status.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} · {result.total} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => load(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => load(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
                  <Users className="h-10 w-10 text-muted-foreground" />
                  <div className="text-lg font-medium">
                    No players match your filters
                  </div>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Try widening your search criteria or clearing filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
