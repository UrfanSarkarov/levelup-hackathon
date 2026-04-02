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

export const navigationItems: NavItem[] = [
  // ── super_admin ───────────────────────────────────────────────────
  {
    title: 'İdarə Paneli',
    href: '/idarepanel',
    icon: 'LayoutDashboard',
    roles: ['super_admin'],
  },
  {
    title: 'Komandalar',
    href: '/idarepanel/komandalar',
    icon: 'Users',
    roles: ['super_admin'],
  },
  {
    title: 'Təlimçilər',
    href: '/idarepanel/telmciler',
    icon: 'GraduationCap',
    roles: ['super_admin'],
  },
  {
    title: 'Mentorlar',
    href: '/idarepanel/mentorlar',
    icon: 'UserCheck',
    roles: ['super_admin'],
  },
  {
    title: 'Münsiflər',
    href: '/idarepanel/munsifler',
    icon: 'Scale',
    roles: ['super_admin'],
  },
  {
    title: 'Nəticələr',
    href: '/idarepanel/qiymetlendirme',
    icon: 'Trophy',
    roles: ['super_admin'],
  },
  {
    title: 'Sessiyalar',
    href: '/idarepanel/sessiyalar',
    icon: 'CalendarDays',
    roles: ['super_admin'],
  },
  {
    title: 'Təqdimatlar',
    href: '/idarepanel/teqdimatlar',
    icon: 'FileUp',
    roles: ['super_admin'],
  },
  {
    title: 'Bildirişlər',
    href: '/idarepanel/bildirisler',
    icon: 'Bell',
    roles: ['super_admin'],
  },
  {
    title: 'Fazalar',
    href: '/idarepanel/fazalar',
    icon: 'GitBranch',
    roles: ['super_admin'],
  },
  {
    title: 'Analitika',
    href: '/idarepanel/analitika',
    icon: 'BarChart3',
    roles: ['super_admin'],
  },
  {
    title: 'Eksport',
    href: '/idarepanel/eksport',
    icon: 'Download',
    roles: ['super_admin'],
  },
  {
    title: 'Ayarlar',
    href: '/idarepanel/ayarlar',
    icon: 'Settings',
    roles: ['super_admin'],
  },

  // ── trainer ───────────────────────────────────────────────────────
  {
    title: 'İdarə Paneli',
    href: '/telminci',
    icon: 'LayoutDashboard',
    roles: ['trainer'],
  },
  {
    title: 'Sessiyalarım',
    href: '/telminci/sessiyalar',
    icon: 'CalendarDays',
    roles: ['trainer'],
  },
  {
    title: 'Profil',
    href: '/telminci/profil',
    icon: 'UserCircle',
    roles: ['trainer'],
  },

  // ── mentor ────────────────────────────────────────────────────────
  {
    title: 'İdarə Paneli',
    href: '/mentor',
    icon: 'LayoutDashboard',
    roles: ['mentor'],
  },
  {
    title: 'Mentorluq Slotları',
    href: '/mentor/slotlar',
    icon: 'Clock',
    roles: ['mentor'],
  },
  {
    title: 'Profil',
    href: '/mentor/profil',
    icon: 'UserCircle',
    roles: ['mentor'],
  },

  // ── jury ──────────────────────────────────────────────────────────
  {
    title: 'İdarə Paneli',
    href: '/munsif',
    icon: 'LayoutDashboard',
    roles: ['jury'],
  },
  {
    title: 'Qiymətləndirmə',
    href: '/munsif/qiymetlendirme',
    icon: 'ClipboardCheck',
    roles: ['jury'],
  },
  {
    title: 'Profil',
    href: '/munsif/profil',
    icon: 'UserCircle',
    roles: ['jury'],
  },

  // ── team_member ───────────────────────────────────────────────────
  {
    title: 'İdarə Paneli',
    href: '/komanda',
    icon: 'LayoutDashboard',
    roles: ['team_member'],
  },
  {
    title: 'Komanda Üzvləri',
    href: '/komanda/uzvler',
    icon: 'UsersRound',
    roles: ['team_member'],
  },
  {
    title: 'Təlimlər',
    href: '/komanda/telimler',
    icon: 'BookOpen',
    roles: ['team_member'],
  },
  {
    title: 'Mentorluq',
    href: '/komanda/mentorluq',
    icon: 'Handshake',
    roles: ['team_member'],
  },
  {
    title: 'Təqdimat',
    href: '/komanda/teqdimat',
    icon: 'FileUp',
    roles: ['team_member'],
  },
  {
    title: 'Bildirişlər',
    href: '/komanda/bildirisler',
    icon: 'Bell',
    roles: ['team_member'],
  },
  {
    title: 'Profil',
    href: '/komanda/profil',
    icon: 'UserCircle',
    roles: ['team_member'],
  },
];

export function getNavigationForRole(role: AppRole): NavItem[] {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function getGroupedNavigation(role: AppRole): NavGroup[] {
  const items = getNavigationForRole(role);

  if (role === 'super_admin') {
    return [
      {
        label: 'Əsas',
        items: items.filter((i) => i.href === '/idarepanel'),
      },
      {
        label: 'İdarəetmə',
        items: items.filter((i) =>
          ['/idarepanel/komandalar', '/idarepanel/telmciler', '/idarepanel/mentorlar', '/idarepanel/munsifler', '/idarepanel/qiymetlendirme'].includes(i.href),
        ),
      },
      {
        label: 'Fəaliyyət',
        items: items.filter((i) =>
          ['/idarepanel/sessiyalar', '/idarepanel/teqdimatlar', '/idarepanel/bildirisler', '/idarepanel/fazalar'].includes(i.href),
        ),
      },
      {
        label: 'Sistem',
        items: items.filter((i) =>
          ['/idarepanel/analitika', '/idarepanel/eksport', '/idarepanel/ayarlar'].includes(i.href),
        ),
      },
    ];
  }

  return [{ label: 'Menyu', items }];
}
