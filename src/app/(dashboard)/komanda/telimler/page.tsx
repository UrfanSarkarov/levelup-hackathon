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
  XCircle,
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

export default function TelimlerPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch('/api/sessions?type=training');
        const data = await res.json();

        if (data.teamId) setTeamId(data.teamId);
        if (data.teamStatus === 'rejected') { setRejected(true); setLoading(false); return; }

        setSessions(
          (data.sessions ?? []).map((s: { id: string; title: string; host_name: string | null; session_date: string; start_time: string; end_time: string; capacity: number; booked: number; isBooked: boolean }) => {
            const dateObj = new Date(s.session_date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('az-AZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            return {
              id: s.id,
              title: s.title,
              trainer: s.host_name ?? 'Namelum',
              date: dateStr,
              time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
              capacity: s.capacity,
              booked: s.booked,
              isBooked: s.isBooked,
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
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="space-y-6">
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

      {rejected ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 py-6">
            <XCircle className="size-8 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Bu bolmeye giris baglidir</p>
              <p className="text-sm text-red-600">Komandaniz secilmediyi ucun telim sessiyalarina qosulmaq mumkun deyil.</p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
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

                  <div className="space-y-1">
                    <Progress value={capacityPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {capacityPercent}% dolu
                    </p>
                  </div>

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
