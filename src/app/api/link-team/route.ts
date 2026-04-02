import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Find team_members with matching email and no user_id linked
    const { data: members } = await supabase
      .from('team_members')
      .select('id, team_id')
      .eq('email', email)
      .is('user_id', null);

    if (!members || members.length === 0) {
      return NextResponse.json({ linked: false, message: 'No unlinked team member found' });
    }

    // Link user_id to the team member record(s)
    const { error } = await supabase
      .from('team_members')
      .update({ user_id: userId })
      .eq('email', email)
      .is('user_id', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ linked: true, teamId: members[0].team_id });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
