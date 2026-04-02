'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/app.types';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Azerbaijani breadcrumb labels ────────────────────────────────────
const segmentLabels: Record<string, string> = {
  dashboard: 'Ana Sehife',
  teams: 'Komandalar',
  trainers: 'Telimciler',
  mentors: 'Mentorlar',
  jury: 'Munsifler',
  sessions: 'Sessiyalar',
  judging: 'Qiymetlendirme',
  submissions: 'Teqdimatlar',
  notifications: 'Bildirisler',
  phases: 'Fazalar',
  analytics: 'Analitika',
  export: 'Eksport',
  settings: 'Ayarlar',
  profile: 'Profil',
  users: 'Istifadeciler',
  'my-sessions': 'Sessiyalarim',
  'mentoring-slots': 'Mentorluq Slotlari',
  'my-team': 'Komanda Uzvleri',
  trainings: 'Telimler',
  mentoring: 'Mentorluq',
  'my-submission': 'Teqdimat',
};

// ── Initials helper ──────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Component ────────────────────────────────────────────────────────

interface AppHeaderProps {
  profile: Profile;
}

export function AppHeader({ profile }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Build breadcrumb segments from the pathname
  const segments = pathname.split('/').filter(Boolean);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/giris');
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      {/* ── Mobile sidebar trigger ───────────────────────────────────── */}
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mr-2 !h-4" />

      {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const href = '/' + segments.slice(0, index + 1).join('/');
            const label = segmentLabels[segment] ?? segment;
            const isLast = index === segments.length - 1;

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {!isLast ? (
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Right side actions ────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          onClick={() => router.push('/dashboard/notifications')}
          aria-label="Bildirisler"
        >
          <Bell className="size-4" />
          {/* Unread count badge */}
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 flex size-4 items-center justify-center p-0 text-[10px]"
          >
            0
          </Badge>
        </Button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar size="sm">
              {profile.avatar_url ? (
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.full_name}
                />
              ) : null}
              <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/profile')}
              >
                <User className="mr-2 size-4" />
                <span>Profil</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="mr-2 size-4" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              <span>Cixis</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
