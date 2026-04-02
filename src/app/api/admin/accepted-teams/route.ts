import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) return NextResponse.json({ teams: [] });

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, track')
    .eq('hackathon_id', hackathon.id)
    .eq('status', 'accepted')
    .order('name');

  return NextResponse.json({ teams: teams ?? [] });
}
