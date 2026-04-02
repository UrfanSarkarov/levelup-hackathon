'use server';

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function getAnalyticsData() {
  const supabase = getSupabase();

  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) return { trackData: [], teamSizeData: [], universityData: [] };

  const { data: teams } = await supabase
    .from('teams')
    .select('id, track, team_members(university)')
    .eq('hackathon_id', hackathon.id);

  if (!teams || teams.length === 0) return { trackData: [], teamSizeData: [], universityData: [] };

  // Build track distribution
  const trackCounts = new Map<string, number>();
  teams.forEach((t: any) => {
    const track = t.track ?? 'Diger';
    trackCounts.set(track, (trackCounts.get(track) ?? 0) + 1);
  });
  const trackData = Array.from(trackCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Build team size distribution
  const sizeCounts = new Map<number, number>();
  teams.forEach((t: any) => {
    const size = t.team_members?.length ?? 0;
    if (size > 0) sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1);
  });
  const teamSizeData = Array.from(sizeCounts.entries())
    .map(([size, value]) => ({ name: `${size} uzv`, value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Build university distribution
  const uniCounts = new Map<string, number>();
  teams.forEach((t: any) => {
    (t.team_members ?? []).forEach((m: any) => {
      const uni = m.university ?? 'Diger';
      uniCounts.set(uni, (uniCounts.get(uni) ?? 0) + 1);
    });
  });
  const universityData = Array.from(uniCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { trackData, teamSizeData, universityData };
}
