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
  Timer,
  Users,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Mock data ───────────────────────────────────────────── */
interface MentorSlot {
  id: string;
  date: string;
  time: string;
  duration: string;
  teamName: string | null;
  status: 'available' | 'booked' | 'completed';
}

const MOCK_SLOTS: MentorSlot[] = [
  {
    id: '1',
    date: '6 Aprel 2026',
    time: '10:00 - 11:00',
    duration: '60 deqiqe',
    teamName: 'CodeCrafters',
    status: 'booked',
  },
  {
    id: '2',
    date: '8 Aprel 2026',
    time: '14:00 - 15:00',
    duration: '60 deqiqe',
    teamName: null,
    status: 'available',
  },
  {
    id: '3',
    date: '10 Aprel 2026',
    time: '16:00 - 17:00',
    duration: '60 deqiqe',
    teamName: 'InnoVision',
    status: 'booked',
  },
  {
    id: '4',
    date: '2 Aprel 2026',
    time: '11:00 - 12:00',
    duration: '60 deqiqe',
    teamName: 'ByteBuilders',
    status: 'completed',
  },
  {
    id: '5',
    date: '12 Aprel 2026',
    time: '15:00 - 16:00',
    duration: '60 deqiqe',
    teamName: null,
    status: 'available',
  },
];

function statusLabel(status: MentorSlot['status']): string {
  switch (status) {
    case 'available':
      return 'Movcuddur';
    case 'booked':
      return 'Bron edilib';
    case 'completed':
      return 'Tamamlandi';
  }
}

function statusColor(status: MentorSlot['status']): string {
  switch (status) {
    case 'available':
      return 'bg-[#6BBF6B]/10 text-[#6BBF6B]';
    case 'booked':
      return 'bg-[#2EC4B6] text-white';
    case 'completed':
      return 'bg-[#0D47A1] text-white';
  }
}

/* ── Page ────────────────────────────────────────────────── */
export default function MentorSlotlarPage() {
  const [slots, setSlots] = useState<MentorSlot[]>(MOCK_SLOTS);
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlots() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');

        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('trainer_id', user.id)
          .eq('session_type', 'mentoring')
          .order('scheduled_date', { ascending: true });

        if (error) throw error;
        if (!sessions) {
          setSlots([]);
          setUseMock(false);
          return;
        }

        const mappedSlots: MentorSlot[] = [];

        for (const session of sessions) {
          const startTime = session.start_time?.slice(0, 5) || '00:00';
          const endTime = session.end_time?.slice(0, 5) || '00:00';
          const dateObj = new Date(session.scheduled_date);
          const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
          const dateStr = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

          // Calculate duration in minutes from start_time / end_time
          const [sh, sm] = startTime.split(':').map(Number);
          const [eh, em] = endTime.split(':').map(Number);
          const durationMin = (eh * 60 + em) - (sh * 60 + sm);
          const durationStr = `${durationMin > 0 ? durationMin : 60} deqiqe`;

          // Get bookings for this session
          const { data: bookings } = await supabase
            .from('session_bookings')
            .select('id, user_id')
            .eq('session_id', session.id);

          let teamName: string | null = null;
          const isBooked = bookings && bookings.length > 0;

          if (isBooked) {
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

          // Determine status
          const now = new Date();
          const sessionDate = new Date(session.scheduled_date);
          let status: MentorSlot['status'] = 'available';
          if (isBooked && sessionDate < now) {
            status = 'completed';
          } else if (isBooked) {
            status = 'booked';
          }

          mappedSlots.push({
            id: session.id,
            date: dateStr,
            time: `${startTime} - ${endTime}`,
            duration: durationStr,
            teamName,
            status,
          });
        }

        setSlots(mappedSlots);
        setUseMock(false);
      } catch {
        // Keep mock data on error
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Yuklenilir...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock-data warning */}
      {useMock && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Supabase-a qosula bilmedi. Mock data gosterilir.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#6BBF6B]/10 p-2">
            <UserCheck className="size-5 text-[#6BBF6B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Mentorluq Slotlari
            </h1>
            <p className="text-muted-foreground">
              Butun mentorluq slotlariniz
            </p>
          </div>
        </div>
        <Button className="bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90">
          <Plus className="mr-2 size-4" />
          Yeni slot yarat
        </Button>
      </div>

      {/* Slots list */}
      <div className="space-y-4">
        {slots.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Mentorluq slotu tapilmadi
          </p>
        )}
        {slots.map((slot) => (
          <Card key={slot.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-[#0D47A1]/10">
                  <Calendar className="size-5 text-[#0D47A1]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="size-3.5" />
                      {slot.date}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3.5" />
                      {slot.time}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Timer className="size-3.5" />
                      {slot.duration}
                    </span>
                  </div>
                  {slot.teamName ? (
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="size-3.5" />
                      Komanda: <span className="font-medium">{slot.teamName}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bron olunmayib
                    </p>
                  )}
                </div>
              </div>
              <Badge className={statusColor(slot.status)}>
                {statusLabel(slot.status)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
