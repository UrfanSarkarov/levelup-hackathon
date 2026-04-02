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
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Plus,
  Trash2,
  Users,
  Pencil,
} from 'lucide-react';
import { createSession, updateSession, deleteSession, getSessions, getHosts } from './actions';

/* ── Types ───────────────────────────────────────────────── */
type SessionType = 'training' | 'mentoring' | 'workshop';

interface SessionRow {
  id: string;
  title: string;
  host: string;
  host_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  time: string;
  type: SessionType;
  currentAttendees: number;
  maxAttendees: number;
  location: string | null;
  is_online: boolean;
}

const TYPE_LABELS: Record<SessionType, string> = {
  training: 'Telim',
  mentoring: 'Mentorluq',
  workshop: 'Seminar',
};

/* ── Page ─────────────────────────────────────────────────── */
export default function SessiyalarPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionType, setSessionType] = useState<'training' | 'mentoring' | 'workshop'>('training');
  const [isOnline, setIsOnline] = useState(false);
  const [trainers, setTrainers] = useState<{id: string; name: string; email: string}[]>([]);
  const [mentors, setMentors] = useState<{id: string; name: string; email: string}[]>([]);
  const [hostId, setHostId] = useState<string>('');
  const [editSession, setEditSession] = useState<SessionRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  async function loadSessions() {
    try {
      const result = await getSessions();
      setSessions(result.sessions as SessionRow[]);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
    getHosts().then(h => { setTrainers(h.trainers); setMentors(h.mentors); });
  }, []);

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
      host_id: hostId || null,
    });
    setSubmitting(false);
    if (result.error) {
      alert('Xeta: ' + result.error);
    } else {
      setDialogOpen(false);
      setHostId('');
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

  function openEdit(session: SessionRow) {
    setEditSession(session);
    setSessionType(session.type);
    setIsOnline(session.is_online);
    setHostId(session.host_id ?? '');
    setEditDialogOpen(true);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editSession) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateSession(editSession.id, {
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      session_type: sessionType,
      session_date: fd.get('session_date') as string,
      start_time: fd.get('start_time') as string,
      end_time: fd.get('end_time') as string,
      location: fd.get('location') as string,
      is_online: isOnline,
      capacity: Number(fd.get('capacity')) || 25,
      host_id: hostId || null,
    });
    setSubmitting(false);
    if (result.error) {
      alert('Xeta: ' + result.error);
    } else {
      setEditDialogOpen(false);
      setEditSession(null);
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
                <Label htmlFor="host">
                  {sessionType === 'mentoring' ? 'Mentor' : 'Təlimçi'} *
                </Label>
                <select
                  id="host"
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Seçin...</option>
                  {(sessionType === 'mentoring' ? mentors : trainers).map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
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
                <Label htmlFor="location">{isOnline ? 'Gorusme linki' : 'Mekan'}</Label>
                <Input id="location" name="location" placeholder={isOnline ? 'https://meet.google.com/...' : 'ADA Universiteti, Otaq 301'} />
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
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Hec bir sessiya tapilmadi
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-[#0D47A1] hover:text-[#0D47A1] hover:bg-[#0D47A1]/10"
                            onClick={() => openEdit(session)}
                            title="Duzelis et"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(session.id)}
                            title="Sil"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sessiyanı redaktə et</DialogTitle>
            <DialogDescription>Sessiya məlumatlarını yeniləyin</DialogDescription>
          </DialogHeader>
          {editSession && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Bashliq *</Label>
                <Input id="edit_title" name="title" required defaultValue={editSession.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Tesvir</Label>
                <Input id="edit_description" name="description" defaultValue="" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nov *</Label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as 'training' | 'mentoring' | 'workshop')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="training">Telim</option>
                    <option value="mentoring">Mentorluq</option>
                    <option value="workshop">Seminar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tutum</Label>
                  <Input name="capacity" type="number" defaultValue={editSession.maxAttendees} min={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{sessionType === 'mentoring' ? 'Mentor' : 'Təlimçi'}</Label>
                <select
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Seçin...</option>
                  {(sessionType === 'mentoring' ? mentors : trainers).map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tarix *</Label>
                <Input name="session_date" type="date" required defaultValue={editSession.date} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bashlama</Label>
                  <Input name="start_time" type="time" defaultValue={editSession.start_time} />
                </div>
                <div className="space-y-2">
                  <Label>Bitmə</Label>
                  <Input name="end_time" type="time" defaultValue={editSession.end_time} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                <Label>Onlayn sessiya</Label>
              </div>
              <div className="space-y-2">
                <Label>{isOnline ? 'Gorusme linki' : 'Mekan'}</Label>
                <Input name="location" defaultValue={editSession.location ?? ''} placeholder={isOnline ? 'https://meet.google.com/...' : 'ADA Universiteti, Otaq 301'} />
              </div>
              <Button type="submit" className="w-full bg-[#0D47A1] hover:bg-[#0D47A1]/90" disabled={submitting}>
                {submitting ? 'Yenilenir...' : 'Deyisiklikleri saxla'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
