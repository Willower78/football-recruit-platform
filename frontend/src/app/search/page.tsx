'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/* ---------- Types ---------- */

interface ScoutingRatings {
  technical: Record<string, number | null>;
  tactical: Record<string, number | null>;
  physical: Record<string, number | null>;
  mental: Record<string, number | null>;
  intangibles: Record<string, number | null>;
}

interface PlayerResult {
  id: string;
  fullName: string | null;
  primaryPosition: string | null;
  secondaryPositions: string[];
  city: string | null;
  country: string | null;
  nationality: string | null;
  dominantFoot: string | null;
  heightCm: number | null;
  weightKg: number | null;
  freeAgent: boolean;
  availabilityStatus: string;
  currentClub: string | null;
  scoutingRatings: ScoutingRatings;
  readinessScore: number | null;
  recommendationCount: number;
  avgCoachRating: number | null;
  hasScoutingReport: boolean;
  overallScoutingScore: number | null;
}

interface ClubItem {
  id: string;
  clubName: string | null;
  city: string | null;
  country: string | null;
  competitionLevel: string | null;
  verified: boolean;
}

interface SavedSearchItem {
  id: string;
  name: string;
  filters: Record<string, string>;
  sortBy: string | null;
  sortOrder: string;
}

type Mode = 'players' | 'clubs';

/* ---------- Filter shape ---------- */

interface Filters {
  position: string;
  positions: string;
  ageMin: string;
  ageMax: string;
  nationality: string;
  country: string;
  city: string;
  dominantFoot: string;
  heightMin: string;
  heightMax: string;
  weightMin: string;
  weightMax: string;
  freeAgent: string;
  availabilityStatus: string;
  competitionLevel: string;
  minFirstTouch: string;
  minPassing: string;
  minDribbling: string;
  minShooting: string;
  minPositionTechnique: string;
  minOffBallMovement: string;
  minGameReading: string;
  minTacticalUnderstanding: string;
  minSpeedAgility: string;
  minStrengthStamina: string;
  minDecisionMaking: string;
  minMentality: string;
  minBodyLanguage: string;
  minOverallScouting: string;
  minReadinessScore: string;
  hasRecommendations: string;
  hasVerifiedRecommendations: string;
  minCoachRating: string;
  hasScoutingReport: string;
  sortBy: string;
  sortOrder: string;
}

const emptyFilters: Filters = {
  position: '', positions: '', ageMin: '', ageMax: '',
  nationality: '', country: '', city: '',
  dominantFoot: '', heightMin: '', heightMax: '',
  weightMin: '', weightMax: '',
  freeAgent: '', availabilityStatus: '', competitionLevel: '',
  minFirstTouch: '', minPassing: '', minDribbling: '',
  minShooting: '', minPositionTechnique: '',
  minOffBallMovement: '', minGameReading: '', minTacticalUnderstanding: '',
  minSpeedAgility: '', minStrengthStamina: '',
  minDecisionMaking: '', minMentality: '', minBodyLanguage: '',
  minOverallScouting: '', minReadinessScore: '',
  hasRecommendations: '', hasVerifiedRecommendations: '',
  minCoachRating: '', hasScoutingReport: '',
  sortBy: '', sortOrder: 'desc',
};

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];

/* ---------- Collapsible Section ---------- */

function FilterSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-3">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-2 text-sm font-medium">
        {title}
        <span className="text-muted-foreground">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="space-y-3 pt-1">{children}</div>}
    </div>
  );
}

/* ---------- Slider input ---------- */

function SliderInput({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: string; onChange: (v: string) => void; min: number; max: number; step?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {value && <span className="text-xs font-medium text-primary">{value}</span>}
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value || min}
        onChange={(e) => onChange(Number(e.target.value) > min ? e.target.value : '')}
        className="w-full accent-primary"
      />
    </div>
  );
}

/* ---------- Toggle ---------- */

function Toggle({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const on = value === 'true';
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(on ? '' : 'true')}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${on ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
      </button>
    </label>
  );
}

/* ---------- Main Page ---------- */

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('players');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => {
    const f = { ...emptyFilters };
    searchParams.forEach((val, key) => {
      if (key in f) (f as Record<string, string>)[key] = val;
    });
    return f;
  });
  const [results, setResults] = useState<(PlayerResult | ClubItem)[]>([]);
  const [total, setTotal] = useState(0);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [saveName, setSaveName] = useState('');

  const isScoutOrClub = user && ['scout', 'club', 'admin'].includes(user.role);

  // Load saved searches
  useEffect(() => {
    if (isScoutOrClub) {
      api<SavedSearchItem[]>('/saved-searches').then(setSavedSearches).catch(() => {});
    }
  }, [isScoutOrClub]);

  const setFilter = useCallback((key: keyof Filters, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  }, []);

  async function run(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    try {
      if (mode === 'clubs') {
        const params = new URLSearchParams();
        if (filters.country) params.set('country', filters.country);
        const res = await api<{ items: ClubItem[] }>(`/clubs?${params}`, { skipAuth: true });
        setResults(res.items ?? []);
        setTotal(res.items?.length ?? 0);
      } else {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(filters)) {
          if (v) params.set(k, v);
        }
        const res = await api<{ items: PlayerResult[]; total: number }>(`/players?${params}`, { skipAuth: true });
        setResults(res.items ?? []);
        setTotal(res.total ?? 0);
      }
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  // Active filter chips
  const activeFilters = Object.entries(filters).filter(
    ([k, v]) => v && k !== 'sortBy' && k !== 'sortOrder',
  );

  async function saveSearch() {
    if (!saveName.trim()) return;
    try {
      await api('/saved-searches', {
        method: 'POST',
        body: JSON.stringify({ name: saveName, filters, sortBy: filters.sortBy || null, sortOrder: filters.sortOrder }),
      });
      setSaveName('');
      const list = await api<SavedSearchItem[]>('/saved-searches');
      setSavedSearches(list);
    } catch { /* noop */ }
  }

  function loadSavedSearch(s: SavedSearchItem) {
    const f = { ...emptyFilters };
    for (const [k, v] of Object.entries(s.filters)) {
      if (k in f) (f as Record<string, string>)[k] = String(v);
    }
    if (s.sortBy) f.sortBy = s.sortBy;
    if (s.sortOrder) f.sortOrder = s.sortOrder;
    setFilters(f);
  }

  async function deleteSavedSearch(id: string) {
    try {
      await api(`/saved-searches/${id}`, { method: 'DELETE' });
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch { /* noop */ }
  }

  return (
    <>
      <SiteHeader />
      <main className="container grid gap-6 py-10 lg:grid-cols-[320px_1fr]">
        {/* --- Filter sidebar --- */}
        <aside className="space-y-2">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex gap-2">
                <Button variant={mode === 'players' ? 'default' : 'outline'} size="sm" onClick={() => setMode('players')}>Players</Button>
                <Button variant={mode === 'clubs' ? 'default' : 'outline'} size="sm" onClick={() => setMode('clubs')}>Clubs</Button>
              </div>

              {mode === 'players' ? (
                <form onSubmit={run} className="space-y-1">
                  {/* Section 1: Position & Profile */}
                  <FilterSection title="Position & Profile" defaultOpen>
                    <div className="space-y-2">
                      <Label className="text-xs">Position</Label>
                      <Select value={filters.position} onChange={(e) => setFilter('position', e.target.value)}>
                        <option value="">Any</option>
                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">Age min</Label><Input type="number" min={14} max={45} value={filters.ageMin} onChange={(e) => setFilter('ageMin', e.target.value)} /></div>
                      <div><Label className="text-xs">Age max</Label><Input type="number" min={14} max={45} value={filters.ageMax} onChange={(e) => setFilter('ageMax', e.target.value)} /></div>
                    </div>
                    <div><Label className="text-xs">Nationality</Label><Input value={filters.nationality} onChange={(e) => setFilter('nationality', e.target.value)} placeholder="e.g. England" /></div>
                    <div><Label className="text-xs">Country</Label><Input value={filters.country} onChange={(e) => setFilter('country', e.target.value)} /></div>
                    <div><Label className="text-xs">City</Label><Input value={filters.city} onChange={(e) => setFilter('city', e.target.value)} /></div>
                    <div>
                      <Label className="text-xs">Dominant foot</Label>
                      <div className="flex gap-3 pt-1">
                        {['left', 'right', 'both'].map((f) => (
                          <label key={f} className="flex items-center gap-1 text-sm capitalize">
                            <input type="checkbox" checked={filters.dominantFoot === f} onChange={() => setFilter('dominantFoot', filters.dominantFoot === f ? '' : f)} />
                            {f}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">Height min (cm)</Label><Input type="number" value={filters.heightMin} onChange={(e) => setFilter('heightMin', e.target.value)} /></div>
                      <div><Label className="text-xs">Height max (cm)</Label><Input type="number" value={filters.heightMax} onChange={(e) => setFilter('heightMax', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">Weight min (kg)</Label><Input type="number" value={filters.weightMin} onChange={(e) => setFilter('weightMin', e.target.value)} /></div>
                      <div><Label className="text-xs">Weight max (kg)</Label><Input type="number" value={filters.weightMax} onChange={(e) => setFilter('weightMax', e.target.value)} /></div>
                    </div>
                  </FilterSection>

                  {/* Section 2: Availability & Status */}
                  <FilterSection title="Availability & Status">
                    <Toggle label="Free agent" value={filters.freeAgent} onChange={(v) => setFilter('freeAgent', v)} />
                    <div>
                      <Label className="text-xs">Availability</Label>
                      <Select value={filters.availabilityStatus} onChange={(e) => setFilter('availabilityStatus', e.target.value)}>
                        <option value="">Any</option>
                        <option value="available">Available</option>
                        <option value="open_to_offers">Open to Offers</option>
                        <option value="not_available">Not Available</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Competition level</Label>
                      <Select value={filters.competitionLevel} onChange={(e) => setFilter('competitionLevel', e.target.value)}>
                        <option value="">Any</option>
                        {['Professional', 'Semi-Pro', 'Academy', 'Amateur', 'Youth'].map((l) => <option key={l} value={l}>{l}</option>)}
                      </Select>
                    </div>
                  </FilterSection>

                  {/* Section 3: Technical Ratings */}
                  <FilterSection title="Technical Ratings">
                    <SliderInput label="First Touch & Composure" value={filters.minFirstTouch} onChange={(v) => setFilter('minFirstTouch', v)} min={1} max={10} />
                    <SliderInput label="Passing Accuracy & Range" value={filters.minPassing} onChange={(v) => setFilter('minPassing', v)} min={1} max={10} />
                    <SliderInput label="Dribbling & Ball Carrying" value={filters.minDribbling} onChange={(v) => setFilter('minDribbling', v)} min={1} max={10} />
                    <SliderInput label="Shooting & Finishing" value={filters.minShooting} onChange={(v) => setFilter('minShooting', v)} min={1} max={10} />
                    <SliderInput label="Position-Specific Technique" value={filters.minPositionTechnique} onChange={(v) => setFilter('minPositionTechnique', v)} min={1} max={10} />
                  </FilterSection>

                  {/* Section 4: Tactical Ratings */}
                  <FilterSection title="Tactical Ratings">
                    <SliderInput label="Off-Ball Movement" value={filters.minOffBallMovement} onChange={(v) => setFilter('minOffBallMovement', v)} min={1} max={10} />
                    <SliderInput label="Game Reading & Anticipation" value={filters.minGameReading} onChange={(v) => setFilter('minGameReading', v)} min={1} max={10} />
                    <SliderInput label="Tactical Role Understanding" value={filters.minTacticalUnderstanding} onChange={(v) => setFilter('minTacticalUnderstanding', v)} min={1} max={10} />
                  </FilterSection>

                  {/* Section 5: Physical Ratings */}
                  <FilterSection title="Physical Ratings">
                    <SliderInput label="Speed & Agility" value={filters.minSpeedAgility} onChange={(v) => setFilter('minSpeedAgility', v)} min={1} max={10} />
                    <SliderInput label="Strength & Stamina" value={filters.minStrengthStamina} onChange={(v) => setFilter('minStrengthStamina', v)} min={1} max={10} />
                  </FilterSection>

                  {/* Section 6: Mental & Intangibles */}
                  <FilterSection title="Mental & Intangibles">
                    <SliderInput label="Decision-Making" value={filters.minDecisionMaking} onChange={(v) => setFilter('minDecisionMaking', v)} min={1} max={10} />
                    <SliderInput label="Mentality & Discipline" value={filters.minMentality} onChange={(v) => setFilter('minMentality', v)} min={1} max={10} />
                    <SliderInput label="Body Language & Consistency" value={filters.minBodyLanguage} onChange={(v) => setFilter('minBodyLanguage', v)} min={1} max={10} />
                  </FilterSection>

                  {/* Section 7: Assessment & Recommendations */}
                  <FilterSection title="Assessment & Recommendations">
                    <SliderInput label="Min Readiness Score" value={filters.minReadinessScore} onChange={(v) => setFilter('minReadinessScore', v)} min={0} max={100} />
                    <Toggle label="Has Coach Recommendations" value={filters.hasRecommendations} onChange={(v) => setFilter('hasRecommendations', v)} />
                    <Toggle label="Has Verified Recommendations" value={filters.hasVerifiedRecommendations} onChange={(v) => setFilter('hasVerifiedRecommendations', v)} />
                    <SliderInput label="Min Coach Rating" value={filters.minCoachRating} onChange={(v) => setFilter('minCoachRating', v)} min={1} max={5} />
                    <Toggle label="Has Scouting Report" value={filters.hasScoutingReport} onChange={(v) => setFilter('hasScoutingReport', v)} />
                  </FilterSection>

                  <Button type="submit" className="w-full">Search</Button>
                </form>
              ) : (
                <form onSubmit={run} className="space-y-3">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={filters.country} onChange={(e) => setFilter('country', e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full">Search</Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Saved searches */}
          {isScoutOrClub && mode === 'players' && (
            <Card>
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium">Saved Searches</p>
                <div className="flex gap-2">
                  <Input placeholder="Name..." value={saveName} onChange={(e) => setSaveName(e.target.value)} className="text-sm" />
                  <Button size="sm" variant="outline" type="button" onClick={saveSearch}>Save</Button>
                </div>
                {savedSearches.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {savedSearches.map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-md border px-2 py-1">
                        <button type="button" className="truncate text-left hover:underline" onClick={() => loadSavedSearch(s)}>{s.name}</button>
                        <button type="button" className="ml-2 shrink-0 text-destructive hover:underline" onClick={() => deleteSavedSearch(s.id)}>x</button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </aside>

        {/* --- Results --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              Search {mode} {total > 0 && <span className="text-base text-muted-foreground">({total} results)</span>}
            </h1>
            {mode === 'players' && (
              <Select value={filters.sortBy} onChange={(e) => { setFilter('sortBy', e.target.value); }} className="w-auto">
                <option value="">Sort: Recent</option>
                <option value="name">Name</option>
                <option value="age">Age</option>
                <option value="overall_scouting_score">Scouting Score</option>
                <option value="readiness_score">Readiness Score</option>
              </Select>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(([key, val]) => (
                <Badge key={key} variant="outline" className="gap-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^min /, '').trim()}: {val}
                  <button type="button" className="ml-1 text-muted-foreground hover:text-foreground" onClick={() => setFilter(key as keyof Filters, '')}>x</button>
                </Badge>
              ))}
              <button type="button" className="text-sm text-muted-foreground hover:underline" onClick={() => setFilters(emptyFilters)}>Clear all</button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                Adjust your filters and press Search.
              </CardContent>
            </Card>
          ) : mode === 'players' ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {results.map((r) => <PlayerCard key={r.id} player={r as PlayerResult} />)}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((r) => <ClubCard key={r.id} club={r as ClubItem} />)}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

/* ---------- PlayerCard ---------- */

function RatingBar({ value, max = 10 }: { value: number | null; max?: number }) {
  if (value == null) return <span className="text-xs text-muted-foreground">—</span>;
  const pct = (Number(value) / max) * 100;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium">{Number(value).toFixed(1)}</span>
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerResult }) {
  const topRatings = getTopRatings(player.scoutingRatings, 3);

  return (
    <Link href={`/players/${player.id}`}>
      <Card className="h-full transition-colors hover:border-primary">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{player.fullName ?? 'Player'}</p>
              <p className="text-sm text-muted-foreground">
                {player.primaryPosition ?? '—'} · {[player.city, player.country].filter(Boolean).join(', ')}
              </p>
            </div>
            {player.primaryPosition && (
              <Badge variant="secondary" className="shrink-0">{player.primaryPosition}</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {player.freeAgent && <Badge variant="secondary" className="text-[10px]">Free agent</Badge>}
            {player.availabilityStatus === 'available' && <Badge variant="success" className="text-[10px]">Available</Badge>}
            {player.recommendationCount > 0 && (
              <Badge variant="outline" className="text-[10px]">{player.recommendationCount} rec{player.recommendationCount !== 1 ? 's' : ''}</Badge>
            )}
            {player.hasScoutingReport && <Badge variant="outline" className="text-[10px]">Scouted</Badge>}
          </div>

          {topRatings.length > 0 && (
            <div className="space-y-1">
              {topRatings.map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">{label}</span>
                  <RatingBar value={val} />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {player.overallScoutingScore != null && (
              <span>Scout: <strong className="text-foreground">{Number(player.overallScoutingScore).toFixed(1)}</strong></span>
            )}
            {player.readinessScore != null && (
              <span>Readiness: <strong className="text-foreground">{Number(player.readinessScore).toFixed(0)}</strong></span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getTopRatings(ratings: ScoutingRatings, n: number): [string, number][] {
  const all: [string, number][] = [];
  const labelMap: Record<string, string> = {
    firstTouch: 'First Touch', passing: 'Passing', dribbling: 'Dribbling',
    shooting: 'Shooting', positionTechnique: 'Pos. Technique',
    offBallMovement: 'Off-Ball', gameReading: 'Game Reading', tacticalUnderstanding: 'Tactics',
    speedAgility: 'Speed', strengthStamina: 'Strength',
    decisionMaking: 'Decision-Making', mentalityDiscipline: 'Mentality',
    bodyLanguageConsistency: 'Body Language',
  };
  for (const domain of Object.values(ratings)) {
    for (const [key, val] of Object.entries(domain)) {
      if (val != null) all.push([labelMap[key] ?? key, Number(val)]);
    }
  }
  all.sort((a, b) => b[1] - a[1]);
  return all.slice(0, n);
}

/* ---------- ClubCard ---------- */

function ClubCard({ club }: { club: ClubItem }) {
  return (
    <Link href={`/clubs/${club.id}`}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{club.clubName ?? 'Club'}</p>
            {club.verified && <Badge variant="success">Verified</Badge>}
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
