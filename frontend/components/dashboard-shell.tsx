'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const PLAYER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/player', icon: LayoutDashboard },
  { label: 'My Profile', href: '/dashboard/player/profile', icon: User },
  { label: 'Search Clubs', href: '/search?entity=clubs', icon: Search },
  { label: 'My Videos', href: '/dashboard/player/videos', icon: Video },
  { label: 'Assessment', href: '/dashboard/player/assessment', icon: Activity },
  { label: 'Settings', href: '/dashboard/player/settings', icon: Settings },
];

const CLUB_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/club', icon: LayoutDashboard },
  { label: 'My Club', href: '/dashboard/club/profile', icon: ShieldCheck },
  { label: 'Search Players', href: '/search', icon: Search },
  { label: 'Shortlists', href: '/dashboard/club/shortlists', icon: ClipboardList },
  { label: 'Recruitment Needs', href: '/dashboard/club/needs', icon: Users },
  { label: 'Settings', href: '/dashboard/club/settings', icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Verification Queue', href: '/dashboard/admin/verification', icon: ShieldCheck },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'Audit Logs', href: '/dashboard/admin/audit', icon: Activity },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const nav =
    user?.role === 'club'
      ? CLUB_NAV
      : user?.role === 'admin'
        ? ADMIN_NAV
        : PLAYER_NAV;

  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase();

  const NavList = (
    <nav className="space-y-1 p-4">
      {nav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 sm:max-w-xs">
              <SheetHeader className="border-b p-4">
                <SheetTitle>Football Recruit</SheetTitle>
              </SheetHeader>
              {NavList}
            </SheetContent>
          </Sheet>
          <Link href="/" className="text-base font-semibold tracking-tight">
            Football Recruit
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm text-slate-700 sm:inline">
                {user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user?.email}</div>
              <div className="text-xs capitalize text-muted-foreground">
                {user?.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
          {NavList}
        </aside>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
