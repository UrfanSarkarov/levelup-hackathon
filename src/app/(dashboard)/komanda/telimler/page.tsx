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
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Calendar,
  Clock,
  User,
  Users,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TrainingSession {
  id: string;
  title: string;
  trainer: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  isBooked: boolean;
}

/* ── Page ────────────────────────────────────────────────── */
export default function TelimlerPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
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

        // Get training sessions
        const { data: dbSessions } = await supabase
          .from('sessions')
          .select('id, title, description, session_type, session_date, start_time, end_time, capacity, host_id, profiles!sessions_host_id_fkey(full_name)')
          .eq('session_type', 'training')
          .order('session_date', { ascending: true });

        if (!dbSessions || dbSessions.length === 0) { setSessions([]); return; }

        // Get booking counts for each session
        const sessionIds = dbSessions.map((s) => s.id);
        const { data: bookings } = await supabase
          .from('session_bookings')
          .select('session_id, status')
          .in('session_id', sessionIds)
          .eq('status', 'confirmed');

        // Get user's own bookings
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

        const bookingCounts: Record<string, number> = {};
        (bookings ?? []).forEach((b) => {
          bookingCounts[b.session_id] = (bookingCounts[b.session_id] ?? 0) + 1;
        });

        setSessions(
          dbSessions.map((s) => {
            const rawProfile = s.profiles as unknown;
            const hostProfile = Array.isArray(rawProfile) ? rawProfile[0] as { full_name: string } | undefined : rawProfile as { full_name: string } | null;
            const dateObj = new Date(s.session_date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('az-AZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            return {
              id: s.id,
              title: s.title,
              trainer: hostProfile?.full_name ?? 'Namelum',
              date: dateStr,
              time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
              capacity: s.capacity ?? 30,
              booked: bookingCounts[s.id] ?? 0,
              isBooked: myBookedSessionIds.has(s.id),
            };
          })
        );
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
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
        setSessions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, isBooked: true, booked: s.booked + 1 } : s
          )
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
        <div className="rounded-lg bg-[#2EC4B6]/10 p-2">
          <GraduationCap className="size-5 text-[#2EC4B6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Telim Sessiyalari
          </h1>
          <p className="text-muted-foreground">
            Movcud telim sessiyalarina qosulun
          </p>
        </div>
      </div>

      {/* Session cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <GraduationCap className="mb-3 size-12" />
            <p className="font-medium">Hazirda movcud telim sessiyasi yoxdur</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => {
            const isFull = session.booked >= session.capacity;
            const capacityPercent = Math.round(
              (session.booked / session.capacity) * 100
            );

            return (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    {session.isBooked && (
                      <Badge className="bg-[#6BBF6B] text-white">
                        Bron edilib
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <User className="size-3.5" />
                    {session.trainer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4 shrink-0" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4 shrink-0" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="size-4 shrink-0" />
                      <span>
                        {session.booked} / {session.capacity} yer
                      </span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="space-y-1">
                    <Progress
                      value={capacityPercent}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {capacityPercent}% dolu
                    </p>
                  </div>

                  {/* Book button */}
                  {session.isBooked ? (
                    <Button variant="outline" disabled className="w-full">
                      Bron edilib
                    </Button>
                  ) : isFull ? (
                    <Button variant="outline" disabled className="w-full">
                      Yer qalmayib
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90"
                      onClick={() => handleBook(session.id)}
                      disabled={bookingId === session.id}
                    >
                      {bookingId === session.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      Bron et
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
