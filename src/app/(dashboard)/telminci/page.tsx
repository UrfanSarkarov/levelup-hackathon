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
import {
  GraduationCap,
  CalendarCheck,
  Users,
  Clock,
  Calendar,
  Loader2,
  Inbox,
  Monitor,
  MapPin,
} from 'lucide-react';

interface TrainerSession {
  id: string;
  title: string;
  date: string;
  time: string;
  bookedCount: number;
  capacity: number;
  is_online: boolean;
  location: string | null;
  teams: { teamName: string | null }[];
}

export default function TelminciPaneliPage() {
  const [sessions, setSessions] = useState<TrainerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    activeSessions: '0',
    totalBookings: '0',
    nextSession: '-',
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/my-sessions?type=training');
        const data = await res.json();
        const apiSessions = data.sessions ?? [];

        if (apiSessions.length === 0) {
          setLoading(false);
          return;
        }

        const mapped: TrainerSession[] = apiSessions.map((s: { id: string; title: string; session_date: string; start_time: string; end_time: string; capacity: number; booked: number; is_online: boolean; location: string | null; teams: { teamName: string | null }[] }) => {
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
            time: `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`,
            bookedCount: s.booked ?? 0,
            capacity: s.capacity ?? 30,
            is_online: s.is_online,
            location: s.location,
            teams: s.teams ?? [],
          };
        });

        const totalBookings = mapped.reduce((sum, s) => sum + s.bookedCount, 0);
        const futureSessions = apiSessions.filter(
          (s: { session_date: string }) => new Date(s.session_date) >= new Date()
        );
        const nextDate = futureSessions.length > 0
          ? new Date(futureSessions[0].session_date + 'T00:00:00').toLocaleDateString('az-AZ', {
              day: 'numeric',
              month: 'long',
            })
          : '-';

        setKpiData({
          activeSessions: String(mapped.length),
          totalBookings: String(totalBookings),
          nextSession: nextDate,
        });
        setSessions(mapped);
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

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
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <GraduationCap className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Telimci Paneli
          </h1>
          <p className="text-muted-foreground">
            Telim sessiyalarinizi idare edin
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
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

          <Card>
            <CardHeader>
              <CardTitle>Sessiyalarim</CardTitle>
              <CardDescription>Size teyin olunmus telim sessiyalari</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Inbox className="mb-3 size-12" />
                  <p className="font-medium">Hele hec bir sessiya yoxdur</p>
                </div>
              ) : (
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
                              {session.is_online ? (
                                <Monitor className="size-3.5 text-[#2EC4B6]" />
                              ) : (
                                <MapPin className="size-3.5 text-[#0D47A1]" />
                              )}
                              {session.is_online
                                ? 'Onlayn'
                                : session.location ?? 'Mekan teyin edilmeyib'}
                            </span>
                          </div>
                          {session.teams.length > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Qeydiyyat: {session.teams.map(t => t.teamName).filter(Boolean).join(', ')}
                            </p>
                          )}
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
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
