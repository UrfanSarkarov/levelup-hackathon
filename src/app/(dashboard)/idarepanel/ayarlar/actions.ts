'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function updateHackathonSettings(data: {
  id: string;
  title: string;
  description: string;
  current_phase: string;
  max_teams: number | null;
  min_team_size: number;
  max_team_size: number;
  registration_start: string | null;
  registration_end: string | null;
  start_date: string | null;
  end_date: string | null;
}) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('hackathons')
    .update({
      title: data.title,
      description: data.description,
      current_phase: data.current_phase,
      max_teams: data.max_teams,
      min_team_size: data.min_team_size,
      max_team_size: data.max_team_size,
      registration_start: data.registration_start || null,
      registration_end: data.registration_end || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    })
    .eq('id', data.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/idarepanel/ayarlar');
  revalidatePath('/');
  return { success: true };
}
