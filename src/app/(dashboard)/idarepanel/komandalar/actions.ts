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

// Add team to active judging round (finalist)
export async function addTeamToFinalist(teamId: string) {
  const supabase = getSupabase();

  // Get active judging round
  const { data: round } = await supabase
    .from('judging_rounds')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!round) {
    return { error: 'Aktiv qiymetlendirme raundu yoxdur. Evvelce Munsifler bolmesinden raund yaradin.' };
  }

  // Check if already assigned
  const { data: existing } = await supabase
    .from('judge_assignments')
    .select('id')
    .eq('round_id', round.id)
    .eq('team_id', teamId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: 'Bu komanda artiq finala elave edilib' };
  }

  // Get all judges
  const { data: judges } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'jury');

  if (!judges || judges.length === 0) {
    return { error: 'Hec bir munsif tapilmadi' };
  }

  // Assign team to all judges
  const assignments = judges.map(j => ({
    round_id: round.id,
    judge_id: j.user_id,
    team_id: teamId,
  }));

  const { error } = await supabase.from('judge_assignments').insert(assignments);
  if (error) return { error: error.message };

  // Get hackathon for notification
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Notify team members
  try {
    const { data: team } = await supabase.from('teams').select('name').eq('id', teamId).single();
    const { data: members } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .not('user_id', 'is', null);

    const notifications = (members ?? []).map((m: { user_id: string }) => ({
      hackathon_id: hackathon?.id,
      user_id: m.user_id,
      type: 'team_update',
      title: 'Komandaniz finala kecdi!',
      body: `"${team?.name ?? ''}" komandasi finala kecdi. Tebriklər! Sprint merhelesine hazirlasin!`,
      is_read: false,
    }));

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }
  } catch { /* ignore */ }

  revalidatePath('/idarepanel/komandalar');
  revalidatePath('/idarepanel/qiymetlendirme');
  return { success: true };
}

// Delete all rejected teams (for cleaning up test data)
export async function deleteRejectedTeams() {
  const supabase = getSupabase();

  // Get latest hackathon
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) return { error: 'Hackathon tapilmadi' };

  // Get all rejected teams
  const { data: rejectedTeams } = await supabase
    .from('teams')
    .select('id')
    .eq('hackathon_id', hackathon.id)
    .eq('status', 'rejected');

  if (!rejectedTeams || rejectedTeams.length === 0) {
    return { error: 'Redd edilmis komanda tapilmadi' };
  }

  const teamIds = rejectedTeams.map(t => t.id);
  const count = teamIds.length;

  // Delete related data manually (in case cascade is not set up)
  try {
    // Get submissions for these teams
    const { data: submissions } = await supabase
      .from('submissions')
      .select('id')
      .in('team_id', teamIds);

    const submissionIds = (submissions ?? []).map(s => s.id);

    // Get judge assignments
    const { data: assignments } = await supabase
      .from('judge_assignments')
      .select('id')
      .in('team_id', teamIds);

    const assignmentIds = (assignments ?? []).map(a => a.id);

    // Delete scores tied to these assignments
    if (assignmentIds.length > 0) {
      await supabase.from('scores').delete().in('assignment_id', assignmentIds);
    }

    // Delete judge assignments
    if (assignmentIds.length > 0) {
      await supabase.from('judge_assignments').delete().in('team_id', teamIds);
    }

    // Delete submissions
    if (submissionIds.length > 0) {
      await supabase.from('submissions').delete().in('team_id', teamIds);
    }

    // Delete session bookings
    await supabase.from('session_bookings').delete().in('team_id', teamIds);

    // Delete team members
    await supabase.from('team_members').delete().in('team_id', teamIds);

    // Finally delete teams
    const { error } = await supabase.from('teams').delete().in('id', teamIds);
    if (error) return { error: error.message };
  } catch (err) {
    return { error: 'Silinerken xeta: ' + (err instanceof Error ? err.message : 'Namelum xeta') };
  }

  revalidatePath('/idarepanel/komandalar');
  revalidatePath('/idarepanel');
  return { success: true, count };
}

// Delete all non-accepted teams (for cleaning up test data)
export async function deleteNonAcceptedTeams() {
  const supabase = getSupabase();

  // Get latest hackathon
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) return { error: 'Hackathon tapilmadi' };

  // Get all non-accepted teams (pending, rejected, draft, etc.)
  const { data: testTeams } = await supabase
    .from('teams')
    .select('id')
    .eq('hackathon_id', hackathon.id)
    .not('status', 'in', '(accepted,active)');

  if (!testTeams || testTeams.length === 0) {
    return { error: 'Silinecek komanda tapilmadi' };
  }

  const teamIds = testTeams.map(t => t.id);
  const count = teamIds.length;

  try {
    // Get judge assignments
    const { data: assignments } = await supabase
      .from('judge_assignments')
      .select('id')
      .in('team_id', teamIds);

    const assignmentIds = (assignments ?? []).map(a => a.id);

    // Delete scores tied to these assignments
    if (assignmentIds.length > 0) {
      await supabase.from('scores').delete().in('assignment_id', assignmentIds);
      await supabase.from('judge_assignments').delete().in('team_id', teamIds);
    }

    // Delete submissions
    await supabase.from('submissions').delete().in('team_id', teamIds);

    // Delete session bookings
    await supabase.from('session_bookings').delete().in('team_id', teamIds);

    // Delete team members
    await supabase.from('team_members').delete().in('team_id', teamIds);

    // Finally delete teams
    const { error } = await supabase.from('teams').delete().in('id', teamIds);
    if (error) return { error: error.message };
  } catch (err) {
    return { error: 'Silinerken xeta: ' + (err instanceof Error ? err.message : 'Namelum xeta') };
  }

  revalidatePath('/idarepanel/komandalar');
  revalidatePath('/idarepanel');
  return { success: true, count };
}

// Remove team from active judging round
export async function removeTeamFromFinalist(teamId: string) {
  const supabase = getSupabase();

  const { data: round } = await supabase
    .from('judging_rounds')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!round) return { error: 'Aktiv raund yoxdur' };

  await supabase
    .from('judge_assignments')
    .delete()
    .eq('round_id', round.id)
    .eq('team_id', teamId);

  revalidatePath('/idarepanel/komandalar');
  revalidatePath('/idarepanel/qiymetlendirme');
  return { success: true };
}
