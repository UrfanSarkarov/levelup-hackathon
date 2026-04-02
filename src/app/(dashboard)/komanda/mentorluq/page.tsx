'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  Calendar,
  Clock,
  Lightbulb,
  Monitor,
  MapPin,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MentorSlot {
  id: string;
  mentorName: string;
  expertise: string;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  isBooked: boolean;
}

/* ── Page ────────────────────────────────────────────────── */
export default function MentorluqPage() {
  const [slots, setSlots] = useState<MentorSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlots() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Find the user's team
        const { data: membership } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (membership) {
          setTeamId(membership.team_id);
        }

        // Get mentoring sessions
        const { data: dbSessions } = await supabase
          .from('sessions')
          .select('id, title, description, session_date, start_time, end_time, is_online, host_id, profiles!sessions_host_id_fkey(full_name, expertise_area)')
          .eq('session_type', 'mentoring')
          .order('session_date', { ascending: true });

        if (!dbSessions || dbSessions.length === 0) { setSlots([]); return; }

        // Get user's own bookings
        const sessionIds = dbSessions.map((s) => s.id);
        const myTeamId = membership?.team_id;
        const { data: myBookings } = myTeamId
          ? await supabase
              .from('session_bookings')
              .select('session_id')
              .eq('team_id', myTeamId)
              .eq('status', 'confirmed')
              .in('session_id', sessionIds)
          : { data: [] };

        const myBookedSessionIds = new Set(
          (myBookings ?? []).map((b) => b.session_id)
        );

        setSlots(
          dbSessions.map((s) => {
            const rawProfile = s.profiles as unknown;
            const hostProfile = Array.isArray(rawProfile) ? rawProfile[0] as { full_name: string; expertise_area: string | null } | undefined : rawProfile as { full_name: string; expertise_area: string | null } | null;
            const dateObj = new Date(s.session_date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('az-AZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            return {
              id: s.id,
              mentorName: hostProfile?.full_name ?? 'Namelum',
              expertise: hostProfile?.expertise_area ?? s.description ?? '',
              date: dateStr,
              time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
              mode: s.is_online ? 'online' : 'offline',
              isBooked: myBookedSessionIds.has(s.id),
            };
          })
        );
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadSlots();
  }, []);

  const handleBook = async (id: string) => {
    if (!teamId) return;
    setBookingId(id);
    try {
      const supabase = createClient();

      const { error } = await supabase.rpc('book_session', {
        _session_id: id,
        _team_id: teamId,
      });

      if (!error) {
        setSlots((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isBooked: true } : s))
        );
      }
    } catch {
      // Silently fail
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#6BBF6B]/10 p-2">
          <UserCheck className="size-5 text-[#6BBF6B]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mentorluq Sessiyalari
          </h1>
          <p className="text-muted-foreground">
            Mentorunuzla gorusme vakti secin
          </p>
        </div>
      </div>

      {/* Mentor slots */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : slots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCheck className="mb-3 size-12" />
            <p className="font-medium">Hazirda movcud mentorluq sessiyasi yoxdur</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-[#0D47A1]/10 text-sm font-bold text-[#0D47A1]">
                      {slot.mentorName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <CardTitle className="text-base">{slot.mentorName}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-0.5">
                        <Lightbulb className="size-3" />
                        {slot.expertise}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4 shrink-0" />
                    <span>{slot.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4 shrink-0" />
                    <span>{slot.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {slot.mode === 'online' ? (
                      <>
                        <Monitor className="size-4 shrink-0 text-[#2EC4B6]" />
                        <Badge variant="outline" className="border-[#2EC4B6] text-[#2EC4B6]">
                          Onlayn
                        </Badge>
                      </>
                    ) : (
                      <>
                        <MapPin className="size-4 shrink-0 text-[#0D47A1]" />
                        <Badge variant="outline" className="border-[#0D47A1] text-[#0D47A1]">
                          Oflayn
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {slot.isBooked ? (
                  <Button variant="outline" disabled className="w-full">
                    Bron edilib
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90"
                    onClick={() => handleBook(slot.id)}
                    disabled={bookingId === slot.id}
                  >
                    {bookingId === slot.id ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Bron et
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
