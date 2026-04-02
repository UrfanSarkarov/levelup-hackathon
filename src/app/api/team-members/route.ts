import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const SESSION_TOKEN = process.env.SESSION_TOKEN || 'lup-session-9f3k2m7x';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(request: NextRequest) {
  const supabase = getServiceSupabase();

  try {
    // Check for Supabase auth user
    const authSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      },
    );
    const { data: { user } } = await authSupabase.auth.getUser();

    let teamId: string | null = null;

    if (user) {
      // Supabase user - find their team by user_id or email
      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1)
        .single();

      teamId = membership?.team_id ?? null;
    }

    // Admin session fallback - show latest team
    if (!teamId) {
      const adminSession = request.cookies.get('lup_session')?.value;
      if (adminSession === SESSION_TOKEN) {
        const teamIdParam = request.nextUrl.searchParams.get('teamId');
        if (teamIdParam) {
          teamId = teamIdParam;
        } else {
          // Get latest hackathon's latest team
          const { data: hackathon } = await supabase
            .from('hackathons')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (hackathon) {
            const { data: latestTeam } = await supabase
              .from('teams')
              .select('id')
              .eq('hackathon_id', hackathon.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            teamId = latestTeam?.id ?? null;
          }
        }
      }
    }

    if (!teamId) {
      return NextResponse.json({ members: [], inviteCode: null });
    }

    // Fetch team members
    const { data: members } = await supabase
      .from('team_members')
      .select('id, full_name, email, role, university, phone')
      .eq('team_id', teamId)
      .order('id', { ascending: true });

    // Fetch invite code
    const { data: team } = await supabase
      .from('teams')
      .select('invite_code, name')
      .eq('id', teamId)
      .single();

    return NextResponse.json({
      members: members ?? [],
      inviteCode: team?.invite_code ?? null,
      teamName: team?.name ?? null,
    });
  } catch {
    return NextResponse.json({ members: [], inviteCode: null }, { status: 500 });
  }
}
