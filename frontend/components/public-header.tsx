import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PublicHeader() {
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Football Recruit
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
