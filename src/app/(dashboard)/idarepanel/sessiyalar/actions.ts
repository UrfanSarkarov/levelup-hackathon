'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function createSession(formData: {
  title: string;
  description: string;
  session_type: 'training' | 'mentoring' | 'workshop';
  session_date: string;
  start_time: string;
  end_time: string;
  location: string;
  is_online: boolean;
  capacity: number;
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

  const { error } = await supabase
    .from('sessions')
    .insert({
      hackathon_id: hackathon.id,
      title: formData.title,
      description: formData.description || null,
      session_type: formData.session_type,
      session_date: formData.session_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      location: formData.is_online ? null : formData.location,
      is_online: formData.is_online,
      capacity: formData.capacity,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/idarepanel/sessiyalar');
  return { success: true };
}

export async function deleteSession(sessionId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/idarepanel/sessiyalar');
  return { success: true };
}
