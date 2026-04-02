import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data: notifs } = await supabase
      .from('notifications')
      .select('id, title, body, type, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ notifications: notifs ?? [] });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
