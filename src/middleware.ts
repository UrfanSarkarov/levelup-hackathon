import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const SESSION_TOKEN = process.env.SESSION_TOKEN || 'lup-session-9f3k2m7x';

// Routes that do NOT require authentication
const publicRoutes = [
  '/',
  '/qeydiyyat',
  '/qeydiyyat-yeni',
  '/giris',
  '/api/qeydiyyat',
  '/api/auth',
  '/api/lup-auth',
  '/api/hesab-yarat',
  '/api/user-role',
  '/api/link-team',
  '/api/team-members',
  '/lup-secure-panel',
];

// Prefixes that should always be public
const publicPrefixes = [
  '/_next',
  '/favicon',
  '/api/auth',
  '/api/lup-auth',
];

function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (publicRoutes.includes(pathname)) return true;

  // Prefix match
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;

  // Static files (images, fonts, etc.)
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|mp4|webm)$/i.test(pathname)) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  // Always refresh the Supabase session cookie
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Allow public routes through
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Check for admin session cookie first
  const adminSession = request.cookies.get('lup_session')?.value;
  if (adminSession === SESSION_TOKEN) {
    return response;
  }

  // For protected routes, check for a valid Supabase user session
  const { createServerClient } = await import('@supabase/ssr');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // We don't need to set cookies here — updateSession already handled it.
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/giris', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - common static asset extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)',
  ],
};
