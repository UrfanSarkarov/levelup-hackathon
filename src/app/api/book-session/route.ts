import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, teamId } = await request.json();
    if (!sessionId || !teamId) {
      return NextResponse.json({ error: 'sessionId ve teamId lazimdir' }, { status: 400 });
    }

    // Verify user is authenticated
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Giris edin' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Check if already booked
    const { data: existing } = await supabase
      .from('session_bookings')
      .select('id')
      .eq('session_id', sessionId)
      .eq('team_id', teamId)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Artiq bron edilib' }, { status: 400 });
    }

    // Check capacity
    const { data: session } = await supabase
      .from('sessions')
      .select('id, title, capacity, host_id, hackathon_id, session_type')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Sessiya tapilmadi' }, { status: 404 });
    }

    const { count } = await supabase
      .from('session_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('status', 'confirmed');

    if ((count ?? 0) >= (session.capacity ?? 30)) {
      return NextResponse.json({ error: 'Yer qalmayib' }, { status: 400 });
    }

    // Create booking
    const { error: bookError } = await supabase
      .from('session_bookings')
      .insert({
        session_id: sessionId,
        team_id: teamId,
        booked_by: user.id,
        status: 'confirmed',
      });

    if (bookError) {
      return NextResponse.json({ error: bookError.message }, { status: 500 });
    }

    // Get team name
    const { data: team } = await supabase
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single();

    const teamName = team?.name ?? 'Namelum komanda';
    const sessionTitle = session.title;
    const typeLabel = session.session_type === 'mentoring' ? 'mentorluq' : 'telim';

    // Send notification to session host
    if (session.host_id) {
      await supabase.from('notifications').insert({
        hackathon_id: session.hackathon_id,
        user_id: session.host_id,
        type: 'session_reminder',
        title: `Yeni ${typeLabel} qeydiyyati`,
        body: `"${teamName}" komandasi "${sessionTitle}" sessiyasina qeydiyyatdan kecdi.`,
        is_read: false,
      });
    }

    // Send notification to admins
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin');

    if (adminRoles && adminRoles.length > 0) {
      const adminNotifs = adminRoles.map((r: { user_id: string }) => ({
        hackathon_id: session.hackathon_id,
        user_id: r.user_id,
        type: 'session_reminder',
        title: `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} qeydiyyati`,
        body: `"${teamName}" komandasi "${sessionTitle}" sessiyasina yazildi.`,
        is_read: false,
      }));
      await supabase.from('notifications').insert(adminNotifs);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Book session error:', err);
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId, teamId } = await request.json();
    if (!sessionId || !teamId) {
      return NextResponse.json({ error: 'sessionId ve teamId lazimdir' }, { status: 400 });
    }

    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Giris edin' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('session_bookings')
      .delete()
      .eq('session_id', sessionId)
      .eq('team_id', teamId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}
