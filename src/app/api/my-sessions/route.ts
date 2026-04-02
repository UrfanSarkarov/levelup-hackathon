import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'training';

  try {
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ sessions: [] });
    }

    const supabase = getServiceSupabase();

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, title, description, session_type, session_date, start_time, end_time, capacity, is_online, location, status, host_id')
      .eq('host_id', user.id)
      .eq('session_type', type)
      .order('session_date', { ascending: true });

    if (!sessions) return NextResponse.json({ sessions: [] });

    const sessionIds = sessions.map(s => s.id);
    const bookingCounts: Record<string, number> = {};
    const bookingDetails: Record<string, { teamName: string | null; participantCount: number }[]> = {};

    if (sessionIds.length > 0) {
      const { data: bookings } = await supabase
        .from('session_bookings')
        .select('session_id, team_id, participant_count, teams(name)')
        .in('session_id', sessionIds)
        .eq('status', 'confirmed');

      (bookings ?? []).forEach((b: { session_id: string; team_id: string; participant_count: number | null; teams: unknown }) => {
        bookingCounts[b.session_id] = (bookingCounts[b.session_id] ?? 0) + 1;
        if (!bookingDetails[b.session_id]) bookingDetails[b.session_id] = [];
        const team = b.teams as { name: string } | null;
        bookingDetails[b.session_id].push({
          teamName: team?.name ?? null,
          participantCount: b.participant_count ?? 1,
        });
      });
    }

    const result = sessions.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      session_date: s.session_date,
      start_time: s.start_time,
      end_time: s.end_time,
      capacity: s.capacity ?? 30,
      is_online: s.is_online,
      location: s.location,
      status: s.status ?? 'active',
      booked: bookingCounts[s.id] ?? 0,
      teams: bookingDetails[s.id] ?? [],
    }));

    return NextResponse.json({ sessions: result });
  } catch {
    return NextResponse.json({ sessions: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { sessionId, status } = await request.json();
    if (!sessionId || !status) {
      return NextResponse.json({ error: 'sessionId ve status lazimdir' }, { status: 400 });
    }

    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Giris edin' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    const { data: session } = await supabase
      .from('sessions')
      .select('id, host_id')
      .eq('id', sessionId)
      .single();

    if (!session || session.host_id !== user.id) {
      return NextResponse.json({ error: 'Icaze yoxdur' }, { status: 403 });
    }

    const { error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}
