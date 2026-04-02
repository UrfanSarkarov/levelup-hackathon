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
  XCircle,
  Users,
  ExternalLink,
  X,
} from 'lucide-react';

interface MentorSlot {
  id: string;
  mentorName: string;
  expertise: string;
  date: string;
  time: string;
  isBooked: boolean;
  is_online: boolean;
  location: string | null;
}

export default function MentorluqPage() {
  const [slots, setSlots] = useState<MentorSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ name: string }[]>([]);

  useEffect(() => {
    async function loadSlots() {
      try {
        const res = await fetch('/api/sessions?type=mentoring');
        const data = await res.json();

        if (data.teamId) setTeamId(data.teamId);
        if (data.teamStatus === 'rejected') { setRejected(true); setLoading(false); return; }
        if (data.teamMembers) setTeamMembers(data.teamMembers);

        setSlots(
          (data.sessions ?? []).map((s: { id: string; title: string; host_name: string | null; expertise_area: string | null; description: string | null; session_date: string; start_time: string; end_time: string; is_online: boolean; isBooked: boolean; location: string | null }) => {
            const dateObj = new Date(s.session_date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('az-AZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            return {
              id: s.id,
              mentorName: s.host_name ?? 'Namelum',
              expertise: s.expertise_area ?? s.description ?? '',
              date: dateStr,
              time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
              isBooked: s.isBooked,
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

    loadSlots();
  }, []);

  const handleBook = async (id: string) => {
    if (!teamId) return;
    setBookingId(id);
    try {
      const res = await fetch('/api/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, teamId }),
      });
      const data = await res.json();

      if (data.error) {
        alert('Xeta: ' + data.error);
      } else {
        setSlots((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isBooked: true } : s))
        );
      }
    } catch {
    } finally {
      setBookingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!teamId) return;
    setCancellingId(id);
    try {
      const res = await fetch('/api/book-session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, teamId }),
      });
      const data = await res.json();

      if (data.error) {
        alert('Xeta: ' + data.error);
      } else {
        setSlots((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isBooked: false } : s))
        );
      }
    } catch {
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
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

      {teamMembers.length > 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <Users className="size-4 text-[#0D47A1] shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Komanda uzvleri: </span>
              <span className="font-medium">{teamMembers.map(m => m.name).join(', ')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {rejected ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 py-6">
            <XCircle className="size-8 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Bu bolmeye giris baglidir</p>
              <p className="text-sm text-red-600">Komandaniz secilmediyi ucun mentorluq sessiyalarina qosulmaq mumkun deyil.</p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
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
                    {slot.is_online ? (
                      <>
                        <Monitor className="size-4 shrink-0 text-[#2EC4B6]" />
                        {slot.location ? (
                          <a
                            href={slot.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0D47A1] hover:underline flex items-center gap-1"
                          >
                            Onlayn gorusme linki
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <Badge variant="outline" className="border-[#2EC4B6] text-[#2EC4B6]">
                            Onlayn
                          </Badge>
                        )}
                      </>
                    ) : (
                      <>
                        <MapPin className="size-4 shrink-0 text-[#0D47A1]" />
                        {slot.location ? (
                          <span className="text-muted-foreground">{slot.location}</span>
                        ) : (
                          <Badge variant="outline" className="border-[#0D47A1] text-[#0D47A1]">
                            Oflayn
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {slot.isBooked ? (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    onClick={() => handleCancel(slot.id)}
                    disabled={cancellingId === slot.id}
                  >
                    {cancellingId === slot.id ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <X className="mr-2 size-4" />
                    )}
                    Bronu legv et
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
