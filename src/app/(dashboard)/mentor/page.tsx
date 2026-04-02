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
  CalendarCheck,
  Users,
  Clock,
  Calendar,
  Plus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MentorSlot {
  id: string;
  date: string;
  time: string;
  teamName: string | null;
  status: 'available' | 'booked';
}

/* ── Page ────────────────────────────────────────────────── */
export default function MentorPaneliPage() {
  const [slots, setSlots] = useState<MentorSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    activeSlots: '0',
    totalMeetings: '0',
    nextMeeting: '-',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');

        // Fetch mentoring sessions for this trainer
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('trainer_id', user.id)
          .eq('session_type', 'mentoring')
          .order('scheduled_date', { ascending: true });

        if (sessionsError) throw sessionsError;
        if (!sessions || sessions.length === 0) {
          setSlots([]);
          setKpiData({ activeSlots: '0', totalMeetings: '0', nextMeeting: '-' });
          return;
        }

        // For each session, get bookings with team info
        const mappedSlots: MentorSlot[] = [];
        let totalBookedCount = 0;

        for (const session of sessions) {
          const startTime = session.start_time?.slice(0, 5) || '00:00';
          const endTime = session.end_time?.slice(0, 5) || '00:00';
          const dateObj = new Date(session.scheduled_date);
          const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
          const dateStr = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

          // Get bookings for this session
          const { data: bookings } = await supabase
            .from('session_bookings')
            .select('id, user_id')
            .eq('session_id', session.id);

          let teamName: string | null = null;
          const isBooked = bookings && bookings.length > 0;

          if (isBooked) {
            totalBookedCount++;
            // Try to find the team name via team_members
            const { data: teamMember } = await supabase
              .from('team_members')
              .select('team_id')
              .eq('user_id', bookings[0].user_id)
              .limit(1)
              .maybeSingle();

            if (teamMember?.team_id) {
              const { data: team } = await supabase
                .from('teams')
                .select('name')
                .eq('id', teamMember.team_id)
                .maybeSingle();
              teamName = team?.name || null;
            }
          }

          mappedSlots.push({
            id: session.id,
            date: dateStr,
            time: `${startTime} - ${endTime}`,
            teamName,
            status: isBooked ? 'booked' : 'available',
          });
        }

        // Calculate KPI values
        const now = new Date();
        const futureSessions = sessions.filter(
          (s: { scheduled_date: string }) => new Date(s.scheduled_date) >= now
        );
        const nextSession = futureSessions[0];
        let nextMeetingStr = '-';
        if (nextSession) {
          const nd = new Date(nextSession.scheduled_date);
          const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
          nextMeetingStr = `${nd.getDate()} ${months[nd.getMonth()]}`;
        }

        setKpiData({
          activeSlots: String(futureSessions.length),
          totalMeetings: String(totalBookedCount),
          nextMeeting: nextMeetingStr,
        });
        setSlots(mappedSlots);
      } catch {
        // Supabase connection failed — show empty state
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpiCards = [
    {
      label: 'Aktiv slotlar',
      value: kpiData.activeSlots,
      icon: CalendarCheck,
      color: 'text-[#0D47A1]',
      bg: 'bg-[#0D47A1]/10',
    },
    {
      label: 'Umumi gorusler',
      value: kpiData.totalMeetings,
      icon: Users,
      color: 'text-[#2EC4B6]',
      bg: 'bg-[#2EC4B6]/10',
    },
    {
      label: 'Gelen gorus',
      value: kpiData.nextMeeting,
      icon: Clock,
      color: 'text-[#6BBF6B]',
      bg: 'bg-[#6BBF6B]/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Yuklenilir...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <UserCheck className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentor Paneli</h1>
          <p className="text-muted-foreground">
            Mentorluq slotlarinizi idarə edin
          </p>
        </div>
      </div>

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

      {/* Slots list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Mentorluq slotlarim</CardTitle>
            <CardDescription>Gelen mentorluq gorusleriniz</CardDescription>
          </div>
          <Button className="bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90">
            <Plus className="mr-2 size-4" />
            Yeni slot yarat
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slots.length === 0 && (
              <p className="py-4 text-center text-muted-foreground">
                Mentorluq slotu tapilmadi
              </p>
            )}
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#6BBF6B]/10">
                    <Calendar className="size-5 text-[#6BBF6B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Calendar className="size-3.5" />
                        {slot.date}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="size-3.5" />
                        {slot.time}
                      </span>
                    </div>
                    {slot.teamName && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Komanda: <span className="font-medium">{slot.teamName}</span>
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  className={
                    slot.status === 'booked'
                      ? 'bg-[#2EC4B6] text-white'
                      : 'bg-[#6BBF6B]/10 text-[#6BBF6B]'
                  }
                >
                  {slot.status === 'booked' ? 'Bron edilib' : 'Movcuddur'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
