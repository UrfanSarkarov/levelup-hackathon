'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as icons from 'lucide-react';
import { LogOut, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AppRole, Profile } from '@/types/app.types';
import { getGroupedNavigation } from '@/config/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// ── Resolve icon name string to lucide component ─────────────────────
function getIcon(name: string): LucideIcon {
  const icon = (icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? icons.CircleDot;
}

// ── Role display labels (Azerbaijani) ────────────────────────────────
const roleLabels: Record<AppRole, string> = {
  super_admin: 'Administrator',
  trainer: 'Təlimçi',
  mentor: 'Mentor',
  jury: 'Münsif',
  team_member: 'Komanda Üzvü',
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

interface AppSidebarProps {
  profile: Profile;
  role: AppRole;
}

export function AppSidebar({ profile, role }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = getGroupedNavigation(role);

  const handleLogout = async () => {
    // Clear admin session cookie
    await fetch('/api/lup-auth', { method: 'DELETE' });
    // Also sign out from Supabase if active
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase not configured — ignore
    }
    router.push('/giris');
  };

  return (
    <Sidebar collapsible="icon">
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Level UP"
              render={<Link href={role === 'super_admin' ? '/idarepanel' : role === 'trainer' ? '/telminci' : role === 'mentor' ? '/mentor' : role === 'jury' ? '/munsif' : '/komanda'} />}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#0D47A1] text-white">
                <Zap className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-[#0D47A1]">Level UP</span>
                <span className="text-xs text-muted-foreground">
                  Hakatlon Platforması
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/idarepanel' && item.href !== '/komanda' && item.href !== '/telminci' && item.href !== '/mentor' && item.href !== '/munsif' &&
                      pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                      >
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      {/* ── User info & Logout ───────────────────────────────────────── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
              <Avatar size="sm">
                {profile.avatar_url ? (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.full_name}
                  />
                ) : null}
                <AvatarFallback>
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">
                  {profile.full_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {roleLabels[role]}
                </span>
              </div>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Hesabdan Cix
              </span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
