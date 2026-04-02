'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function sendNotification(data: {
  recipient: string;
  title: string;
  message: string;
  type: string;
}) {
  const supabase = getSupabase();
  // Get active hackathon
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) {
    return { error: 'Aktiv hakaton tapilmadi' };
  }

  // Determine target user IDs based on recipient
  let userIds: string[] = [];

  if (data.recipient === 'all_teams') {
    const { data: members } = await supabase
      .from('team_members')
      .select('user_id')
      .not('user_id', 'is', null);
    userIds = (members ?? []).map((m) => m.user_id).filter(Boolean);
  } else if (data.recipient === 'trainers') {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'trainer');
    userIds = (roles ?? []).map((r) => r.user_id);
  } else if (data.recipient === 'mentors') {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'mentor');
    userIds = (roles ?? []).map((r) => r.user_id);
  } else if (data.recipient === 'jury') {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'jury');
    userIds = (roles ?? []).map((r) => r.user_id);
  }

  // If no specific users found, create a broadcast notification (user_id = null)
  if (userIds.length === 0) {
    const { error } = await supabase.from('notifications').insert({
      hackathon_id: hackathon.id,
      user_id: null,
      title: data.title,
      message: data.message,
      type: data.type || 'announcement',
      is_read: false,
    });
    if (error) return { error: error.message };
  } else {
    // Create notification for each target user
    const notifications = userIds.map((uid) => ({
      hackathon_id: hackathon.id,
      user_id: uid,
      title: data.title,
      message: data.message,
      type: data.type || 'announcement',
      is_read: false,
    }));

    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) return { error: error.message };
  }

  revalidatePath('/idarepanel/bildirisler');
  return { success: true, count: Math.max(userIds.length, 1) };
}
