export const siteConfig = {
  name: 'Level UP',
  description:
    'Level UP — gənclər üçün hakatlon platforması. Komandanızı qurun, mentorlardan dəstək alın və innovativ layihələrinizi təqdim edin.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ogImage: '/og.png',
  locale: 'az',
  creator: 'Level UP',
  keywords: [
    'hackathon',
    'hakatlon',
    'Level UP',
    'innovasiya',
    'komanda',
    'startap',
    'Azərbaycan',
  ],
  links: {
    github: '',
    support: '',
  },
} as const;

export type SiteConfig = typeof siteConfig;
