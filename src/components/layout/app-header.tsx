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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Azerbaijani breadcrumb labels ────────────────────────────────────
const segmentLabels: Record<string, string> = {
  idarepanel: 'İdarə Paneli',
  komandalar: 'Komandalar',
  telmciler: 'Təlimçilər',
  mentorlar: 'Mentorlar',
  munsifler: 'Münsiflər',
  sessiyalar: 'Sessiyalar',
  qiymetlendirme: 'Qiymətləndirmə',
  teqdimatlar: 'Təqdimatlar',
  bildirisler: 'Bildirişlər',
  fazalar: 'Fazalar',
  analitika: 'Analitika',
  eksport: 'Eksport',
  ayarlar: 'Ayarlar',
  profil: 'Profil',
  komanda: 'Komanda',
  uzvler: 'Üzvlər',
  telimler: 'Təlimlər',
  mentorluq: 'Mentorluq',
  teqdimat: 'Təqdimat',
  telminci: 'Təlimçi',
  mentor: 'Mentor',
  munsif: 'Münsif',
  slotlar: 'Slotlar',
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
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Admin cookie users have no Supabase session
    }
    // Clear admin cookie
    document.cookie = 'lup_session=; path=/; max-age=0';
    router.push('/giris');
  };

  const role = profile.role ?? 'team_member';

  const notificationPath: Record<string, string> = {
    super_admin: '/idarepanel/bildirisler',
    team_member: '/komanda/bildirisler',
    trainer: '/telminci',
    mentor: '/mentor',
    jury: '/munsif',
  };

  const profilePath: Record<string, string> = {
    super_admin: '/idarepanel/ayarlar',
    trainer: '/telminci/profil',
    mentor: '/mentor/profil',
    jury: '/munsif/profil',
    team_member: '/komanda/profil',
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
          onClick={() => router.push(notificationPath[role] || '/komanda/bildirisler')}
          aria-label="Bildirisler"
        >
          <Bell className="size-4" />
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
            <div className="px-1.5 py-1.5">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {profile.email}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push(profilePath[role] || '/komanda/profil')}
            >
              <User className="mr-2 size-4" />
              <span>Profil</span>
            </DropdownMenuItem>

            {role === 'super_admin' && (
              <DropdownMenuItem
                onClick={() => router.push('/idarepanel/ayarlar')}
              >
                <Settings className="mr-2 size-4" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
            )}

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
