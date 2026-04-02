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
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Mock data ───────────────────────────────────────────── */
interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  status: 'active' | 'completed' | 'cancelled';
}

const INITIAL_SESSIONS: Session[] = [
  {
    id: '1',
    title: 'React Advanced Patterns',
    date: '5 Aprel 2026',
    time: '10:00 - 12:00',
    capacity: 30,
    booked: 22,
    status: 'active',
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    date: '10 Aprel 2026',
    time: '14:00 - 16:00',
    capacity: 25,
    booked: 15,
    status: 'active',
  },
  {
    id: '3',
    title: 'Next.js Server Components',
    date: '28 Mart 2026',
    time: '11:00 - 13:00',
    capacity: 20,
    booked: 20,
    status: 'completed',
  },
  {
    id: '4',
    title: 'CSS Architecture',
    date: '25 Mart 2026',
    time: '15:00 - 17:00',
    capacity: 25,
    booked: 0,
    status: 'cancelled',
  },
];

function statusLabel(status: Session['status']): string {
  switch (status) {
    case 'active':
      return 'Aktiv';
    case 'completed':
      return 'Tamamlandi';
    case 'cancelled':
      return 'Legv edildi';
  }
}

function statusColor(status: Session['status']): string {
  switch (status) {
    case 'active':
      return 'bg-[#6BBF6B] text-white';
    case 'completed':
      return 'bg-[#0D47A1] text-white';
    case 'cancelled':
      return 'bg-red-500 text-white';
  }
}

/* ── Page ────────────────────────────────────────────────── */
export default function TelminciSessiyalarPage() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: dbSessions } = await supabase
          .from('sessions')
          .select('id, title, session_date, start_time, end_time, capacity, status')
          .eq('host_id', user.id)
          .eq('session_type', 'training')
          .order('session_date', { ascending: false });

        if (!dbSessions || dbSessions.length === 0) return;

        // Get booking counts
        const sessionIds = dbSessions.map((s) => s.id);
        const { data: bookings } = await supabase
          .from('session_bookings')
          .select('session_id')
          .in('session_id', sessionIds)
          .eq('status', 'confirmed');

        const bookingCounts: Record<string, number> = {};
        (bookings ?? []).forEach((b: { session_id: string }) => {
          bookingCounts[b.session_id] = (bookingCounts[b.session_id] ?? 0) + 1;
        });

        const mapped: Session[] = dbSessions.map((s) => {
          const dateObj = new Date(s.session_date + 'T00:00:00');
          const dateStr = dateObj.toLocaleDateString('az-AZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          // Map DB status to UI status
          let uiStatus: Session['status'] = 'active';
          if (s.status === 'completed') uiStatus = 'completed';
          else if (s.status === 'cancelled') uiStatus = 'cancelled';

          return {
            id: s.id,
            title: s.title,
            date: dateStr,
            time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
            capacity: (s.capacity as number) ?? 30,
            booked: bookingCounts[s.id] ?? 0,
            status: uiStatus,
          };
        });

        setSessions(mapped);
        setUseMock(false);
      } catch {
        // Keep INITIAL_SESSIONS as fallback
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  const handleCancel = async (id: string) => {
    // Optimistic UI update
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' as const } : s))
    );

    if (!useMock) {
      try {
        const supabase = createClient();
        await supabase
          .from('sessions')
          .update({ status: 'cancelled' })
          .eq('id', id);
      } catch {
        // Revert on failure
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'active' as const } : s))
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#0D47A1]/10 p-2">
            <GraduationCap className="size-5 text-[#0D47A1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sessiyalarim
            </h1>
            <p className="text-muted-foreground">
              Butun telim sessiyalariniz
            </p>
          </div>
        </div>
        <Button className="bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90">
          <Plus className="mr-2 size-4" />
          Yeni sessiya
        </Button>
      </div>

      {/* Mock-data banner */}
      {useMock && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Supabase baglantisi qurulmayib — demo melumatlar gosterilir
          </span>
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#2EC4B6]/10">
                    <Calendar className="size-5 text-[#2EC4B6]" />
                  </div>
                  <div>
                    <p className="font-semibold">{session.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {session.booked} / {session.capacity} yer
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(session.status)}>
                    {statusLabel(session.status)}
                  </Badge>
                  {session.status === 'active' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-1 size-3.5" />
                        Redakte et
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleCancel(session.id)}
                      >
                        <Trash2 className="mr-1 size-3.5" />
                        Legv et
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
