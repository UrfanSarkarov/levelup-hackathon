'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Loader2,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  status: 'active' | 'completed' | 'cancelled';
  teams: { teamName: string | null }[];
}

function statusLabel(status: Session['status']): string {
  switch (status) {
    case 'active': return 'Aktiv';
    case 'completed': return 'Tamamlandi';
    case 'cancelled': return 'Legv edildi';
  }
}

function statusColor(status: Session['status']): string {
  switch (status) {
    case 'active': return 'bg-[#6BBF6B] text-white';
    case 'completed': return 'bg-[#0D47A1] text-white';
    case 'cancelled': return 'bg-red-500 text-white';
  }
}

export default function TelminciSessiyalarPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/my-sessions?type=training');
        const data = await res.json();
        setSessions(
          (data.sessions ?? []).map((s: { id: string; title: string; session_date: string; start_time: string; end_time: string; capacity: number; booked: number; status: string; teams: { teamName: string | null }[] }) => {
            const dateObj = new Date(s.session_date + 'T00:00:00');
            return {
              id: s.id,
              title: s.title,
              date: dateObj.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' }),
              time: `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`,
              capacity: s.capacity,
              booked: s.booked,
              status: (s.status === 'completed' ? 'completed' : s.status === 'cancelled' ? 'cancelled' : 'active') as Session['status'],
              teams: s.teams,
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

  const handleCancel = async (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s));
    try {
      const supabase = createClient();
      await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', id);
    } catch {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as const } : s));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <GraduationCap className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sessiyalarim</h1>
          <p className="text-muted-foreground">Size teyin olunmus telim sessiyalari</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Hec bir sessiya tapilmadi</p>
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
                    {session.teams.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Qeydiyyat: {session.teams.map(t => t.teamName).filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(session.status)}>
                    {statusLabel(session.status)}
                  </Badge>
                  {session.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleCancel(session.id)}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Legv et
                    </Button>
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
