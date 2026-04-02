'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function updateTeamStatus(
  teamId: string,
  status: 'accepted' | 'rejected' | 'pending',
) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('teams')
    .update({ status })
    .eq('id', teamId);

  if (error) {
    return { error: error.message };
  }

  // Send notification to team members
  if (status === 'accepted' || status === 'rejected') {
    try {
      // Get team name
      const { data: team } = await supabase
        .from('teams')
        .select('name, hackathon_id')
        .eq('id', teamId)
        .single();

      // Get team members with user_id (linked accounts)
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id, email')
        .eq('team_id', teamId);

      const title =
        status === 'accepted'
          ? 'Komandaniz qebul edildi!'
          : 'Komandaniz secilmedi';

      const body =
        status === 'accepted'
          ? `"${team?.name ?? ''}" komandasi Level UP hackathon-a qebul edildi. Novbeti merehele ucun hazirlasin!`
          : `"${team?.name ?? ''}" komandasi bu defe secilmedi. Gelecek tedbirlerde gormek umidi ile!`;

      const notifType = status === 'accepted' ? 'team_update' : 'warning';

      // Send notification to each member who has a linked user_id
      const notifications = (members ?? [])
        .filter((m: { user_id: string | null }) => m.user_id)
        .map((m: { user_id: string | null }) => ({
          hackathon_id: team?.hackathon_id,
          user_id: m.user_id,
          type: notifType,
          title,
          body,
          is_read: false,
        }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    } catch {
      // Notification failure shouldn't block status update
    }
  }

  revalidatePath('/idarepanel/komandalar');
  revalidatePath('/idarepanel');
  return { success: true };
}

export async function bulkRejectUnselected() {
  const supabase = getSupabase();

  // Get latest hackathon
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) return { error: 'Hackathon tapilmadi' };

  // Find all pending teams and reject them
  const { data: pendingTeams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('hackathon_id', hackathon.id)
    .eq('status', 'pending');

  if (!pendingTeams || pendingTeams.length === 0) {
    return { error: 'Gozleyen komanda yoxdur' };
  }

  // Update all pending to rejected
  const { error } = await supabase
    .from('teams')
    .update({ status: 'rejected' })
    .eq('hackathon_id', hackathon.id)
    .eq('status', 'pending');

  if (error) return { error: error.message };

  // Send notifications to all rejected team members
  try {
    const teamIds = pendingTeams.map((t) => t.id);
    const { data: members } = await supabase
      .from('team_members')
      .select('user_id, team_id')
      .in('team_id', teamIds)
      .not('user_id', 'is', null);

    const teamNameMap = new Map(pendingTeams.map((t) => [t.id, t.name]));

    const notifications = (members ?? []).map((m: { user_id: string; team_id: string }) => ({
      hackathon_id: hackathon.id,
      user_id: m.user_id,
      type: 'warning',
      title: 'Komandaniz secilmedi',
      body: `"${teamNameMap.get(m.team_id) ?? ''}" komandasi bu defe secilmedi. Gelecek tedbirlerde gormek umidi ile!`,
      is_read: false,
    }));

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }
  } catch {
    // Don't fail the operation
  }

  revalidatePath('/idarepanel/komandalar');
  revalidatePath('/idarepanel');
  return { success: true, count: pendingTeams.length };
}
