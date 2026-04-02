import type { AppRole } from '@/types/app.types';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: AppRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// ── Flat list of every sidebar item with role access ────────────────

export const navigationItems: NavItem[] = [
  // Shared
  {
    title: 'İdarə Paneli',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['super_admin', 'trainer', 'mentor', 'jury', 'team_member'],
  },

  // ── super_admin ───────────────────────────────────────────────────
  {
    title: 'Komandalar',
    href: '/dashboard/teams',
    icon: 'Users',
    roles: ['super_admin'],
  },
  {
    title: 'Təlimçilər',
    href: '/dashboard/users/trainers',
    icon: 'GraduationCap',
    roles: ['super_admin'],
  },
  {
    title: 'Mentorlar',
    href: '/dashboard/users/mentors',
    icon: 'UserCheck',
    roles: ['super_admin'],
  },
  {
    title: 'Münsiflər',
    href: '/dashboard/users/jury',
    icon: 'Scale',
    roles: ['super_admin'],
  },
  {
    title: 'Sessiyalar',
    href: '/dashboard/sessions',
    icon: 'CalendarDays',
    roles: ['super_admin'],
  },
  {
    title: 'Qiymətləndirmə',
    href: '/dashboard/judging',
    icon: 'ClipboardCheck',
    roles: ['super_admin', 'jury'],
  },
  {
    title: 'Təqdimatlar',
    href: '/dashboard/submissions',
    icon: 'FileUp',
    roles: ['super_admin'],
  },
  {
    title: 'Bildirişlər',
    href: '/dashboard/notifications',
    icon: 'Bell',
    roles: ['super_admin', 'team_member'],
  },
  {
    title: 'Fazalar',
    href: '/dashboard/phases',
    icon: 'GitBranch',
    roles: ['super_admin'],
  },
  {
    title: 'Analitika',
    href: '/dashboard/analytics',
    icon: 'BarChart3',
    roles: ['super_admin'],
  },
  {
    title: 'Eksport',
    href: '/dashboard/export',
    icon: 'Download',
    roles: ['super_admin'],
  },
  {
    title: 'Ayarlar',
    href: '/dashboard/settings',
    icon: 'Settings',
    roles: ['super_admin'],
  },

  // ── trainer ───────────────────────────────────────────────────────
  {
    title: 'Sessiyalarım',
    href: '/dashboard/my-sessions',
    icon: 'CalendarDays',
    roles: ['trainer'],
  },

  // ── mentor ────────────────────────────────────────────────────────
  {
    title: 'Mentorluq Slotları',
    href: '/dashboard/mentoring-slots',
    icon: 'Clock',
    roles: ['mentor'],
  },

  // ── team_member ───────────────────────────────────────────────────
  {
    title: 'Komanda Üzvləri',
    href: '/dashboard/my-team',
    icon: 'UsersRound',
    roles: ['team_member'],
  },
  {
    title: 'Təlimlər',
    href: '/dashboard/trainings',
    icon: 'BookOpen',
    roles: ['team_member'],
  },
  {
    title: 'Mentorluq',
    href: '/dashboard/mentoring',
    icon: 'Handshake',
    roles: ['team_member'],
  },
  {
    title: 'Təqdimat',
    href: '/dashboard/my-submission',
    icon: 'FileUp',
    roles: ['team_member'],
  },

  // ── Shared – Profil ──────────────────────────────────────────────
  {
    title: 'Profil',
    href: '/dashboard/profile',
    icon: 'UserCircle',
    roles: ['trainer', 'mentor', 'jury', 'team_member'],
  },
];

// ── Helper: filter items visible to a given role ────────────────────

export function getNavigationForRole(role: AppRole): NavItem[] {
  return navigationItems.filter((item) => item.roles.includes(role));
}

// ── Grouped navigation (for sidebar sections) ──────────────────────

export function getGroupedNavigation(role: AppRole): NavGroup[] {
  const items = getNavigationForRole(role);

  if (role === 'super_admin') {
    return [
      {
        label: 'Əsas',
        items: items.filter((i) =>
          ['/dashboard'].includes(i.href),
        ),
      },
      {
        label: 'İdarəetmə',
        items: items.filter((i) =>
          [
            '/dashboard/teams',
            '/dashboard/users/trainers',
            '/dashboard/users/mentors',
            '/dashboard/users/jury',
          ].includes(i.href),
        ),
      },
      {
        label: 'Fəaliyyət',
        items: items.filter((i) =>
          [
            '/dashboard/sessions',
            '/dashboard/judging',
            '/dashboard/submissions',
            '/dashboard/notifications',
            '/dashboard/phases',
          ].includes(i.href),
        ),
      },
      {
        label: 'Sistem',
        items: items.filter((i) =>
          [
            '/dashboard/analytics',
            '/dashboard/export',
            '/dashboard/settings',
          ].includes(i.href),
        ),
      },
    ];
  }

  // All other roles get a flat group
  return [{ label: 'Menyu', items }];
}
