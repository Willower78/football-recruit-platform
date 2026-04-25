import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    title: 'Athlete profiles',
    body: 'Build a rich, verifiable profile with stats, videos, coach recommendations, and a psychometric assessment.',
  },
  {
    title: 'Club & tryout discovery',
    body: 'Clubs post detailed needs, tryouts, and open spots. Athletes filter by position, age, geography, and playing style.',
  },
  {
    title: 'Trust and verification',
    body: 'Official-website and tiered verification reduce noise so every connection feels credible.',
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <img src="/logo.png" alt="Apex Draft" className="h-24 w-auto md:h-32" />
          <span className="rounded-full border border-secondary bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">
            Talent is everywhere, opportunity is not
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Where amateur athletes find their next opportunity.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            The world&apos;s platform for amateur athletes — discover tryouts, connect with clubs
            and scouts, and take the next step in your career with AI-assisted scouting.
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

        <section className="container grid gap-6 pb-24 md:grid-cols-3">
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
