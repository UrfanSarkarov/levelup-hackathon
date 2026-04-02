'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Calendar,
  Clock,
  Timer,
  Users,
  Loader2,
  Monitor,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface MentorSlot {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  teamName: string | null;
  participantCount: number;
  status: 'available' | 'booked' | 'completed';
  is_online: boolean;
  location: string | null;
}

function statusLabel(status: MentorSlot['status']): string {
  switch (status) {
    case 'available': return 'Movcuddur';
    case 'booked': return 'Bron edilib';
    case 'completed': return 'Tamamlandi';
  }
}

function statusColor(status: MentorSlot['status']): string {
  switch (status) {
    case 'available': return 'bg-[#6BBF6B]/10 text-[#6BBF6B]';
    case 'booked': return 'bg-[#2EC4B6] text-white';
    case 'completed': return 'bg-[#0D47A1] text-white';
  }
}

export default function MentorSlotlarPage() {
  const [slots, setSlots] = useState<MentorSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/my-sessions?type=mentoring');
        const data = await res.json();

        setSlots(
          (data.sessions ?? []).map((s: { id: string; title: string; session_date: string; start_time: string; end_time: string; booked: number; teams: { teamName: string | null; participantCount: number }[]; is_online: boolean; location: string | null }) => {
            const dateObj = new Date(s.session_date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
            const startTime = s.start_time.slice(0, 5);
            const endTime = s.end_time.slice(0, 5);
            const [sh, sm] = startTime.split(':').map(Number);
            const [eh, em] = endTime.split(':').map(Number);
            const durationMin = (eh * 60 + em) - (sh * 60 + sm);

            const isBooked = s.booked > 0;
            const isPast = dateObj < new Date();
            let status: MentorSlot['status'] = 'available';
            if (isBooked && isPast) status = 'completed';
            else if (isBooked) status = 'booked';

            return {
              id: s.id,
              title: s.title,
              date: dateStr,
              time: `${startTime} - ${endTime}`,
              duration: `${durationMin > 0 ? durationMin : 60} deqiqe`,
              teamName: s.teams?.[0]?.teamName ?? null,
              participantCount: s.teams?.[0]?.participantCount ?? 1,
              status,
              is_online: s.is_online,
              location: s.location,
            };
          })
        );
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#6BBF6B]/10 p-2">
          <UserCheck className="size-5 text-[#6BBF6B]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentorluq Slotlari</h1>
          <p className="text-muted-foreground">Size teyin olunmus mentorluq sessiyalari</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : slots.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Mentorluq slotu tapilmadi</p>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#0D47A1]/10">
                      <Calendar className="size-5 text-[#0D47A1]" />
                    </div>
                    <div>
                      <p className="font-semibold">{slot.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
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
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        {slot.is_online ? (
                          <>
                            <Monitor className="size-3.5 text-[#2EC4B6]" />
                            {slot.location ? (
                              <a href={slot.location} target="_blank" rel="noopener noreferrer" className="text-[#0D47A1] hover:underline flex items-center gap-1">
                                Onlayn gorusme linki <ExternalLink className="size-3" />
                              </a>
                            ) : (
                              <span>Onlayn</span>
                            )}
                          </>
                        ) : slot.location ? (
                          <>
                            <MapPin className="size-3.5 text-[#0D47A1]" />
                            <span>{slot.location}</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="size-3.5" />
                            <span>Mekan teyin edilmeyib</span>
                          </>
                        )}
                      </div>
                      {slot.teamName ? (
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="size-3.5" />
                          <span>Komanda: <span className="font-medium">{slot.teamName}</span></span>
                          <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
                            {slot.participantCount} nefer
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Bron olunmayib</p>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColor(slot.status)}>
                    {statusLabel(slot.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
