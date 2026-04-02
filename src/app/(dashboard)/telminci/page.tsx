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
  CalendarCheck,
  Users,
  Clock,
  Calendar,
  Plus,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Mock data ───────────────────────────────────────────── */
interface TrainerSession {
  id: string;
  title: string;
  date: string;
  time: string;
  bookedCount: number;
  capacity: number;
}

const MOCK_SESSIONS: TrainerSession[] = [
  {
    id: '1',
    title: 'React Advanced Patterns',
    date: '5 Aprel 2026',
    time: '10:00 - 12:00',
    bookedCount: 22,
    capacity: 30,
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    date: '10 Aprel 2026',
    time: '14:00 - 16:00',
    bookedCount: 15,
    capacity: 25,
  },
];

/* ── Page ────────────────────────────────────────────────── */
export default function TelminciPaneliPage() {
  const [sessions, setSessions] = useState<TrainerSession[]>(MOCK_SESSIONS);
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    activeSessions: '2',
    totalBookings: '37',
    nextSession: '5 Aprel',
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch trainer's training sessions
        const { data: dbSessions } = await supabase
          .from('sessions')
          .select('id, title, session_date, start_time, end_time, capacity, status')
          .eq('host_id', user.id)
          .eq('session_type', 'training')
          .order('session_date', { ascending: true });

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

        const mapped: TrainerSession[] = dbSessions.map((s) => {
          const dateObj = new Date(s.session_date + 'T00:00:00');
          const dateStr = dateObj.toLocaleDateString('az-AZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          return {
            id: s.id,
            title: s.title,
            date: dateStr,
            time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
            bookedCount: bookingCounts[s.id] ?? 0,
            capacity: (s.capacity as number) ?? 30,
          };
        });

        // Calculate KPI values
        const activeSessions = dbSessions.filter(
          (s) => s.status === 'active' || s.status === 'scheduled'
        );
        const totalBookings = Object.values(bookingCounts).reduce(
          (sum, c) => sum + c,
          0
        );
        const futureSessions = dbSessions.filter(
          (s) => new Date(s.session_date) >= new Date()
        );
        const nextDate = futureSessions.length > 0
          ? new Date(futureSessions[0].session_date + 'T00:00:00').toLocaleDateString('az-AZ', {
              day: 'numeric',
              month: 'long',
            })
          : '-';

        setKpiData({
          activeSessions: String(activeSessions.length),
          totalBookings: String(totalBookings),
          nextSession: nextDate,
        });
        setSessions(mapped);
        setUseMock(false);
      } catch {
        // Keep mock data as fallback
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* ── KPI cards ───────────────────────────────────────────── */
  const kpiCards = [
    {
      label: 'Aktiv sessiyalar',
      value: kpiData.activeSessions,
      icon: CalendarCheck,
      color: 'text-[#0D47A1]',
      bg: 'bg-[#0D47A1]/10',
    },
    {
      label: 'Umumi bron',
      value: kpiData.totalBookings,
      icon: Users,
      color: 'text-[#2EC4B6]',
      bg: 'bg-[#2EC4B6]/10',
    },
    {
      label: 'Gelen sessiya',
      value: kpiData.nextSession,
      icon: Clock,
      color: 'text-[#6BBF6B]',
      bg: 'bg-[#6BBF6B]/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <GraduationCap className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Telimci Paneli
          </h1>
          <p className="text-muted-foreground">
            Telim sessiyalarinizi idarə edin
          </p>
        </div>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {kpiCards.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.label}>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardDescription>{c.label}</CardDescription>
                    <div className={`rounded-lg p-2 ${c.bg}`}>
                      <Icon className={`size-5 ${c.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{c.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sessions list */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Sessiyalarim</CardTitle>
                <CardDescription>Gelen telim sessiyalariniz</CardDescription>
              </div>
              <Button className="bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90">
                <Plus className="mr-2 size-4" />
                Yeni sessiya yarat
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-[#2EC4B6]/10">
                        <Calendar className="size-5 text-[#2EC4B6]" />
                      </div>
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {session.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        <Users className="mr-1 size-3" />
                        {session.bookedCount} / {session.capacity}
                      </Badge>
                      <Badge className="bg-[#6BBF6B] text-white">Aktiv</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
