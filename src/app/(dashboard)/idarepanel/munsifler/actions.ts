'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function inviteJudge(data: {
  fullName: string;
  email: string;
  password: string;
  specialty: string;
}) {
  const supabase = getSupabase();

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const exists = existingUsers?.users?.find(u => u.email === data.email);
  if (exists) {
    return { error: 'Bu e-poçt artıq qeydiyyatdan keçib' };
  }

  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.fullName },
  });

  if (authErr || !authData.user) {
    return { error: 'İstifadəçi yaradılarkən xəta: ' + (authErr?.message ?? '') };
  }

  const userId = authData.user.id;

  await supabase.from('profiles').insert({
    id: userId,
    email: data.email,
    full_name: data.fullName,
    expertise_area: data.specialty,
  });

  const { error: roleErr } = await supabase.from('user_roles').insert({
    user_id: userId,
    role: 'jury',
  });

  if (roleErr) {
    return { error: 'Rol təyin edilərkən xəta: ' + roleErr.message };
  }

  revalidatePath('/idarepanel/munsifler');
  return { success: true };
}

export async function deleteJudge(userId: string) {
  const supabase = getSupabase();

  await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'jury');
  await supabase.from('profiles').delete().eq('id', userId);
  await supabase.auth.admin.deleteUser(userId);

  revalidatePath('/idarepanel/munsifler');
  return { success: true };
}

// Create judging round and assign selected teams to all judges
export async function createJudgingRound(data: {
  name: string;
  teamIds: string[];
}) {
  const supabase = getSupabase();

  if (!data.name || data.teamIds.length === 0) {
    return { error: 'Raund adi ve en az 1 komanda secilmelidir' };
  }

  // Get hackathon
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) return { error: 'Hackathon tapilmadi' };

  // Deactivate existing rounds
  await supabase
    .from('judging_rounds')
    .update({ is_active: false })
    .eq('hackathon_id', hackathon.id);

  // Get next round number
  const { data: lastRound } = await supabase
    .from('judging_rounds')
    .select('round_number')
    .eq('hackathon_id', hackathon.id)
    .order('round_number', { ascending: false })
    .limit(1)
    .single();

  const roundNumber = (lastRound?.round_number ?? 0) + 1;

  // Create round
  const { data: newRound, error: roundErr } = await supabase
    .from('judging_rounds')
    .insert({
      hackathon_id: hackathon.id,
      name: data.name,
      round_number: roundNumber,
      is_active: true,
    })
    .select('id')
    .single();

  if (roundErr || !newRound) {
    return { error: 'Raund yaradilarkən xeta: ' + (roundErr?.message ?? '') };
  }

  // Get all judges
  const { data: judges } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'jury');

  if (!judges || judges.length === 0) {
    return { error: 'Hec bir munsif tapilmadi. Evvelce munsif elave edin.' };
  }

  // Assign each team to each judge
  const assignments = [];
  for (const judge of judges) {
    for (const teamId of data.teamIds) {
      assignments.push({
        round_id: newRound.id,
        judge_id: judge.user_id,
        team_id: teamId,
      });
    }
  }

  const { error: assignErr } = await supabase
    .from('judge_assignments')
    .insert(assignments);

  if (assignErr) {
    return { error: 'Teyin etme xetasi: ' + assignErr.message };
  }

  // Notify finalist teams
  try {
    for (const teamId of data.teamIds) {
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
        .not('user_id', 'is', null);

      const notifications = (members ?? []).map((m: { user_id: string }) => ({
        hackathon_id: hackathon.id,
        user_id: m.user_id,
        type: 'team_update',
        title: 'Komandaniz finala kecdi!',
        body: 'Tebriklər! Komandaniz final merhelesine secildi. Sprint merhelesine hazirlasin!',
        is_read: false,
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    }
  } catch {
    // don't fail
  }

  revalidatePath('/idarepanel/munsifler');
  revalidatePath('/idarepanel/qiymetlendirme');
  return { success: true, roundId: newRound.id };
}
