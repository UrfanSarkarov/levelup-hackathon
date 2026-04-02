import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { AppRole, Profile } from '@/types/app.types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

const SESSION_TOKEN = process.env.SESSION_TOKEN || 'lup-session-9f3k2m7x';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  // 1. Check admin session cookie
  const adminSession = cookieStore.get('lup_session')?.value;
  const isAdmin = adminSession === SESSION_TOKEN;

  // 2. Try Supabase auth
  let supabaseUser = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    supabaseUser = user;
  } catch {
    // Supabase not configured — fall through
  }

  // 3. If neither auth method succeeded, redirect to login
  if (!isAdmin && !supabaseUser) {
    redirect('/giris');
  }

  // 4. Build profile
  let userProfile: Profile;
  let userRole: AppRole;

  if (supabaseUser) {
    // Supabase user — fetch profile and role from DB
    let fetchedRole: AppRole = 'team_member';
    try {
      const serviceClient = createServiceClient();
      const [{ data: profile }, { data: roleRow }] = await Promise.all([
        serviceClient.from('profiles').select('*').eq('id', supabaseUser.id).single(),
        serviceClient.from('user_roles').select('role').eq('user_id', supabaseUser.id).single(),
      ]);

      if (roleRow?.role) {
        fetchedRole = roleRow.role as AppRole;
      }

      userProfile = profile
        ? { ...profile, role: fetchedRole }
        : {
            id: supabaseUser.id,
            email: supabaseUser.email ?? '',
            full_name: supabaseUser.user_metadata?.full_name ?? 'İstifadəçi',
            avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
            role: fetchedRole,
            phone: null,
            bio: null,
            organization: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
    } catch {
      userProfile = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        full_name: supabaseUser.user_metadata?.full_name ?? 'İstifadəçi',
        avatar_url: null,
        role: fetchedRole,
        phone: null,
        bio: null,
        organization: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    userRole = fetchedRole;
  } else {
    // Admin cookie auth — use admin profile
    userProfile = {
      id: 'admin',
      email: 'admin@levelup.az',
      full_name: 'Administrator',
      avatar_url: null,
      role: 'super_admin' as AppRole,
      phone: null,
      bio: null,
      organization: 'Level UP',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    userRole = 'super_admin';
  }

  return (
    <SidebarProvider>
      <AppSidebar profile={userProfile} role={userRole} />
      <SidebarInset>
        <AppHeader profile={userProfile} />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
