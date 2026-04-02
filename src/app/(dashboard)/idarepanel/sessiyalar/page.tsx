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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// native select used for reliability with base-ui
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createSession, deleteSession } from './actions';

/* ── Types ───────────────────────────────────────────────── */
type SessionType = 'training' | 'mentoring' | 'workshop';

interface SessionRow {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  type: SessionType;
  currentAttendees: number;
  maxAttendees: number;
  location: string | null;
}

/* ── Mock data ────────────────────────────────────────────── */
const MOCK_SESSIONS: SessionRow[] = [
  { id: '1', title: 'Frontend Development ile tanis olun', host: 'Farid Abdullayev', date: '2026-04-12', time: '10:00 - 12:00', type: 'training', currentAttendees: 18, maxAttendees: 25, location: 'ADA Universiteti, Otaq 301' },
  { id: '2', title: 'Layihe planlasdirmasi', host: 'Kamran Rzayev', date: '2026-04-13', time: '14:00 - 15:30', type: 'mentoring', currentAttendees: 4, maxAttendees: 5, location: null },
  { id: '3', title: 'API dizayni ve integrasiyasi', host: 'Orkhan Huseynov', date: '2026-04-14', time: '10:00 - 12:00', type: 'training', currentAttendees: 22, maxAttendees: 25, location: 'ADA Universiteti, Otaq 204' },
  { id: '4', title: 'Mehsul strategiyasi meslehetleri', host: 'Narmin Ismayilova', date: '2026-04-15', time: '16:00 - 17:00', type: 'mentoring', currentAttendees: 3, maxAttendees: 5, location: null },
  { id: '5', title: 'UI/UX dizayn prinsipleri', host: 'Gunay Mammadova', date: '2026-04-16', time: '10:00 - 13:00', type: 'training', currentAttendees: 15, maxAttendees: 30, location: 'Barama Innovation Center' },
  { id: '6', title: 'Texniki arxitektura icmali', host: 'Vugar Mammadov', date: '2026-04-17', time: '11:00 - 12:30', type: 'mentoring', currentAttendees: 2, maxAttendees: 4, location: null },
];

const TYPE_LABELS: Record<SessionType, string> = {
  training: 'Telim',
  mentoring: 'Mentorluq',
  workshop: 'Seminar',
};

/* ── Page ─────────────────────────────────────────────────── */
export default function SessiyalarPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [useMock, setUseMock] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionType, setSessionType] = useState<'training' | 'mentoring' | 'workshop'>('training');
  const [isOnline, setIsOnline] = useState(false);

  async function loadSessions() {
    const supabase = createClient();
    try {
      const { data: hackathon } = await supabase
        .from('hackathons')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!hackathon) throw new Error('no hackathon');

      const { data: dbSessions, error } = await supabase
        .from('sessions')
        .select('id, title, session_type, session_date, start_time, end_time, location, is_online, capacity, host_id, profiles!sessions_host_id_fkey(full_name)')
        .eq('hackathon_id', hackathon.id)
        .order('session_date', { ascending: true });

      if (error || !dbSessions || dbSessions.length === 0) throw new Error('no sessions');

      const sessionIds = dbSessions.map((s: { id: string }) => s.id);
      const { data: bookings } = await supabase
        .from('session_bookings')
        .select('session_id')
        .in('session_id', sessionIds)
        .eq('status', 'confirmed');

      const bookingCounts = new Map<string, number>();
      (bookings ?? []).forEach((b: { session_id: string }) => {
        bookingCounts.set(b.session_id, (bookingCounts.get(b.session_id) ?? 0) + 1);
      });

      setSessions(dbSessions.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        title: s.title as string,
        host: ((s.profiles as Record<string, string> | null)?.full_name) ?? '-',
        date: s.session_date as string,
        time: `${(s.start_time as string).slice(0, 5)} - ${(s.end_time as string).slice(0, 5)}`,
        type: s.session_type as SessionType,
        currentAttendees: bookingCounts.get(s.id as string) ?? 0,
        maxAttendees: (s.capacity as number) ?? 30,
        location: s.is_online ? null : (s.location as string | null),
      })));
      setUseMock(false);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSessions(); }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const result = await createSession({
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      session_type: sessionType,
      session_date: fd.get('session_date') as string,
      start_time: fd.get('start_time') as string,
      end_time: fd.get('end_time') as string,
      location: fd.get('location') as string,
      is_online: isOnline,
      capacity: Number(fd.get('capacity')) || 25,
    });
    setSubmitting(false);
    if (result.error) {
      alert('Xeta: ' + result.error);
    } else {
      setDialogOpen(false);
      loadSessions();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu sessiyanı silmək istədiyinizə əminsiniz?')) return;
    const result = await deleteSession(id);
    if (result.error) {
      alert('Xeta: ' + result.error);
    } else {
      loadSessions();
    }
  }

  const filtered =
    activeTab === 'all'
      ? sessions
      : sessions.filter((s) => s.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sessiyalar</h1>
          <p className="text-muted-foreground">
            Butun telim ve mentorluq sessiyalari
          </p>
        </div>
        <Button className="bg-[#0D47A1] hover:bg-[#0D47A1]/90" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Yeni sessiya
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Yeni sessiya yarat</DialogTitle>
              <DialogDescription>Telim ve ya mentorluq sessiyasi elave edin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Bashliq *</Label>
                <Input id="title" name="title" required placeholder="Sessiya adi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Tesvir</Label>
                <Input id="description" name="description" placeholder="Qisa tesvir" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_type">Nov *</Label>
                  <select
                    id="session_type"
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as 'training' | 'mentoring' | 'workshop')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="training">Telim</option>
                    <option value="mentoring">Mentorluq</option>
                    <option value="workshop">Seminar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Tutum</Label>
                  <Input id="capacity" name="capacity" type="number" defaultValue={25} min={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_date">Tarix *</Label>
                <Input id="session_date" name="session_date" type="date" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Bashlama</Label>
                  <Input id="start_time" name="start_time" type="time" defaultValue="10:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Bitmə</Label>
                  <Input id="end_time" name="end_time" type="time" defaultValue="12:00" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="is_online" checked={isOnline} onCheckedChange={setIsOnline} />
                <Label htmlFor="is_online">Onlayn sessiya</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Mekan</Label>
                <Input id="location" name="location" placeholder="ADA Universiteti, Otaq 301" />
              </div>
              <Button type="submit" className="w-full bg-[#0D47A1] hover:bg-[#0D47A1]/90" disabled={submitting}>
                {submitting ? 'Yaradilir...' : 'Sessiyanı yarat'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Hamisi</TabsTrigger>
          <TabsTrigger value="training">Telim</TabsTrigger>
          <TabsTrigger value="mentoring">Mentorluq</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Yuklenilir...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {filtered.map((session) => {
                const capacityPercent = Math.round(
                  (session.currentAttendees / session.maxAttendees) * 100
                );
                const isFull = session.currentAttendees >= session.maxAttendees;

                return (
                  <Card key={session.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">
                          {session.title}
                        </CardTitle>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={
                              session.type === 'training'
                                ? 'border-[#0D47A1]/30 text-[#0D47A1] bg-[#0D47A1]/5'
                                : 'border-[#2EC4B6]/30 text-[#2EC4B6] bg-[#2EC4B6]/5'
                            }
                          >
                            {TYPE_LABELS[session.type]}
                          </Badge>
                          {!useMock && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(session.id)}
                              title="Sil"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription>{session.host}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      {/* Date & Time */}
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5" />
                          <span>
                            {new Date(session.date).toLocaleDateString('az-AZ', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.location ? (
                            <>
                              <MapPin className="size-3.5" />
                              <span>{session.location}</span>
                            </>
                          ) : (
                            <>
                              <Monitor className="size-3.5" />
                              <span>Onlayn</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Capacity bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="size-3.5" />
                            <span>Tutum</span>
                          </div>
                          <span
                            className={`font-medium ${
                              isFull ? 'text-red-500' : 'text-foreground'
                            }`}
                          >
                            {session.currentAttendees}/{session.maxAttendees}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFull
                                ? 'bg-red-400'
                                : capacityPercent > 75
                                  ? 'bg-amber-400'
                                  : 'bg-[#2EC4B6]'
                            }`}
                            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
