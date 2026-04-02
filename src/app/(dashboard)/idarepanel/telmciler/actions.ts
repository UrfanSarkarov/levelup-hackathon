'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function inviteTrainer(data: {
  fullName: string;
  email: string;
  password: string;
  specialty: string;
}) {
  const supabase = getSupabase();

  // Check if email already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const exists = existingUsers?.users?.find(u => u.email === data.email);
  if (exists) {
    return { error: 'Bu e-poçt artıq qeydiyyatdan keçib' };
  }

  // Create auth user
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

  // Create profile
  await supabase.from('profiles').insert({
    id: userId,
    email: data.email,
    full_name: data.fullName,
    expertise_area: data.specialty,
  });

  // Assign trainer role
  const { error: roleErr } = await supabase.from('user_roles').insert({
    user_id: userId,
    role: 'trainer',
  });

  if (roleErr) {
    return { error: 'Rol təyin edilərkən xəta: ' + roleErr.message };
  }

  revalidatePath('/idarepanel/telmciler');
  return { success: true };
}

export async function deleteTrainer(userId: string) {
  const supabase = getSupabase();

  await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'trainer');
  await supabase.from('profiles').delete().eq('id', userId);
  await supabase.auth.admin.deleteUser(userId);

  revalidatePath('/idarepanel/telmciler');
  return { success: true };
}
