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
  host_id: string | null;
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
      location: formData.location || null,
      is_online: formData.is_online,
      capacity: formData.capacity,
      host_id: formData.host_id || null,
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

export async function getSessions() {
  const supabase = getSupabase();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!hackathon) return { sessions: [] };

  const { data: dbSessions } = await supabase
    .from('sessions')
    .select('id, title, session_type, session_date, start_time, end_time, location, is_online, capacity, host_id')
    .eq('hackathon_id', hackathon.id)
    .order('session_date', { ascending: true });

  if (!dbSessions) return { sessions: [] };

  // Fetch host profiles separately
  const hostIds = [...new Set(dbSessions.map(s => s.host_id).filter(Boolean))];
  const hostMap = new Map<string, string>();
  if (hostIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', hostIds);
    (profiles ?? []).forEach((p: { id: string; full_name: string }) => {
      hostMap.set(p.id, p.full_name);
    });
  }

  // Booking counts
  const sessionIds = dbSessions.map(s => s.id);
  const { data: bookings } = await supabase
    .from('session_bookings')
    .select('session_id')
    .in('session_id', sessionIds)
    .eq('status', 'confirmed');

  const bookingCounts = new Map<string, number>();
  (bookings ?? []).forEach((b: { session_id: string }) => {
    bookingCounts.set(b.session_id, (bookingCounts.get(b.session_id) ?? 0) + 1);
  });

  const sessions = dbSessions.map((s) => ({
    id: s.id,
    title: s.title,
    host: s.host_id ? (hostMap.get(s.host_id) ?? '-') : '-',
    date: s.session_date,
    time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
    type: s.session_type,
    currentAttendees: bookingCounts.get(s.id) ?? 0,
    maxAttendees: s.capacity ?? 30,
    location: s.location,
    is_online: s.is_online,
  }));

  return { sessions };
}

export async function getHosts() {
  const supabase = getSupabase();

  // Get trainers
  const { data: trainerRoles } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'trainer');

  const trainerIds = (trainerRoles ?? []).map((r: { user_id: string }) => r.user_id);

  // Get mentors
  const { data: mentorRoles } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'mentor');

  const mentorIds = (mentorRoles ?? []).map((r: { user_id: string }) => r.user_id);

  const allIds = [...new Set([...trainerIds, ...mentorIds])];

  if (allIds.length === 0) return { trainers: [], mentors: [] };

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', allIds);

  const profileMap = new Map((profiles ?? []).map((p: { id: string; full_name: string; email: string }) => [p.id, p]));

  const trainers = trainerIds.map(id => profileMap.get(id)).filter(Boolean).map((p: any) => ({ id: p.id, name: p.full_name, email: p.email }));
  const mentors = mentorIds.map(id => profileMap.get(id)).filter(Boolean).map((p: any) => ({ id: p.id, name: p.full_name, email: p.email }));

  return { trainers, mentors };
}
