'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function updateTeamStatus(teamId: string, status: 'accepted' | 'rejected') {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('teams')
    .update({ status })
    .eq('id', teamId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/idarepanel/komandalar');
  revalidatePath('/idarepanel');
  return { success: true };
}
