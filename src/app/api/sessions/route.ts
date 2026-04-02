import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/server';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'training'; // training | mentoring

  try {
    const supabase = getServiceSupabase();

    // Get current user's team via Supabase auth
    let myTeamId: string | null = null;
    try {
      const authClient = await createBrowserClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        const { data: membership } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        myTeamId = membership?.team_id ?? null;
      }
    } catch {
      // No auth user
    }

    // Fetch sessions with host profile
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, title, description, session_type, session_date, start_time, end_time, capacity, is_online, host_id, profiles!sessions_host_id_fkey(full_name, expertise_area)')
      .eq('session_type', type)
      .order('session_date', { ascending: true });

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ sessions: [], teamId: myTeamId });
    }

    // Get booking counts
    const sessionIds = sessions.map((s) => s.id);
    const { data: bookings } = await supabase
      .from('session_bookings')
      .select('session_id, status')
      .in('session_id', sessionIds)
      .eq('status', 'confirmed');

    // Get user's bookings
    let myBookedIds: string[] = [];
    if (myTeamId) {
      const { data: myBookings } = await supabase
        .from('session_bookings')
        .select('session_id')
        .eq('team_id', myTeamId)
        .eq('status', 'confirmed')
        .in('session_id', sessionIds);
      myBookedIds = (myBookings ?? []).map((b) => b.session_id);
    }

    const bookingCounts: Record<string, number> = {};
    (bookings ?? []).forEach((b) => {
      bookingCounts[b.session_id] = (bookingCounts[b.session_id] ?? 0) + 1;
    });

    const result = sessions.map((s) => {
      const rawProfile = s.profiles as unknown;
      const hostProfile = Array.isArray(rawProfile)
        ? (rawProfile[0] as { full_name: string; expertise_area: string | null } | undefined)
        : (rawProfile as { full_name: string; expertise_area: string | null } | null);

      return {
        id: s.id,
        title: s.title,
        description: s.description,
        session_date: s.session_date,
        start_time: s.start_time,
        end_time: s.end_time,
        capacity: s.capacity ?? 30,
        is_online: s.is_online,
        host_name: hostProfile?.full_name ?? null,
        expertise_area: hostProfile?.expertise_area ?? null,
        booked: bookingCounts[s.id] ?? 0,
        isBooked: myBookedIds.includes(s.id),
      };
    });

    return NextResponse.json({ sessions: result, teamId: myTeamId });
  } catch (err) {
    console.error('Sessions API error:', err);
    return NextResponse.json({ sessions: [], teamId: null });
  }
}
