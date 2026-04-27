import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    title: 'Player profiles',
    body: 'Build a rich, verifiable profile with stats, videos, coach recommendations, and a psychometric assessment.',
  },
  {
    title: 'Club discovery',
    body: 'Clubs post detailed needs and filter players by position, age, geography, and playing style.',
  },
  {
    title: 'Tryout discovery',
    body: 'Browse open tryouts posted by clubs, filter by position, location, and age group, and apply in one click.',
  },
  {
    title: 'Trust and verification',
    body: 'Official-website and tiered verification reduce noise so every match feels credible.',
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            For players, clubs, and scouts
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Connecting football talent with the clubs looking for them.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            A modern, verifiable recruitment platform that goes beyond highlight reels —
            psychometrics, coach recommendations, and AI-assisted scouting.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/register?role=player">I&apos;m a player</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/register?role=club">I&apos;m a club</Link>
            </Button>
          </div>
        </section>

        <section className="container grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="space-y-2 p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
