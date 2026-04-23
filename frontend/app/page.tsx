import Link from 'next/link';
import {
  BadgeCheck,
  Brain,
  ClipboardList,
  Users,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PublicHeader } from '@/components/public-header';

const features = [
  {
    icon: Video,
    title: 'AI Video Analysis',
    description:
      'Upload match footage and receive objective scouting reports on technique, decision-making and physical metrics.',
  },
  {
    icon: Brain,
    title: 'Player Readiness Assessment',
    description:
      'A 100-question psychological assessment across 10 domains helps clubs understand the whole athlete.',
  },
  {
    icon: ClipboardList,
    title: 'Coach Recommendations',
    description:
      'Request verified recommendations from coaches who have worked with you, attached directly to your profile.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Clubs',
    description:
      'Clubs are tiered and verified so players engage with legitimate opportunities rather than spam.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-24 text-center">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Connect Football Talent with Clubs
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              AI-powered scouting and a transparent marketplace that helps
              players get seen and clubs make better recruitment decisions.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <Card className="border-2 transition hover:border-primary">
                <CardHeader className="items-center text-center">
                  <Users className="mb-2 h-10 w-10 text-slate-700" />
                  <CardTitle>I&apos;m a Player</CardTitle>
                  <CardDescription>
                    Build a scouting-ready profile and get in front of clubs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/auth/register?role=player">
                      Create player account
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 transition hover:border-primary">
                <CardHeader className="items-center text-center">
                  <BadgeCheck className="mb-2 h-10 w-10 text-slate-700" />
                  <CardTitle>I&apos;m a Club</CardTitle>
                  <CardDescription>
                    Post recruitment needs and search a pool of verified talent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/auth/register?role=club">
                      Create club account
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            What you get
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <f.icon className="mb-2 h-8 w-8 text-slate-700" />
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
          © {new Date().getFullYear()} Football Recruit Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
