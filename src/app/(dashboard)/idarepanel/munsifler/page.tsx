'use client';

import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { inviteJudge, deleteJudge } from './actions';

interface JuryRow {
  id: string;
  name: string;
  email: string;
  specialty: string;
  assignedTeams: string[];
}

export default function MunsiflerPage() {
  const [jury, setJury] = useState<JuryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', specialty: '' });

  const loadJury = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { data: roles } = await supabase
        .from('user_roles').select('user_id').eq('role', 'jury');

      if (!roles || roles.length === 0) { setJury([]); setLoading(false); return; }

      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles').select('id, full_name, email, expertise_area').in('id', ids);

      const { data: assignments } = await supabase
        .from('judge_assignments').select('judge_id, teams(name)').in('judge_id', ids);

      const teamMap = new Map<string, string[]>();
      (assignments ?? []).forEach((a: { judge_id: string; teams: { name: string }[] | { name: string } | null }) => {
        const list = teamMap.get(a.judge_id) ?? [];
        const teamObj = Array.isArray(a.teams) ? a.teams[0] : a.teams;
        if (teamObj?.name) list.push(teamObj.name);
        teamMap.set(a.judge_id, list);
      });

      setJury((profiles ?? []).map((p: { id: string; full_name: string | null; email: string; expertise_area: string | null }) => ({
        id: p.id,
        name: p.full_name ?? p.email,
        email: p.email,
        specialty: p.expertise_area ?? '-',
        assignedTeams: teamMap.get(p.id) ?? [],
      })));
    } catch {
      setJury([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadJury(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await inviteJudge(form);
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    setDialogOpen(false);
    setForm({ fullName: '', email: '', password: '', specialty: '' });
    setSubmitting(false);
    loadJury();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu münsifi silmək istəyirsiniz?')) return;
    await deleteJudge(id);
    loadJury();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Münsiflər</h1>
          <p className="text-muted-foreground">Layihələri qiymətləndirən münsif heyəti</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#0D47A1]/10 px-3 py-2 text-sm font-medium text-[#0D47A1]">
            <Users className="size-4" />
            <span>{jury.length} münsif</span>
          </div>
          <Button className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white" onClick={() => setDialogOpen(true)}>
            <UserPlus className="size-4 mr-2" />
            Yeni münsif dəvət et
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni münsif dəvət et</DialogTitle>
            <DialogDescription>Münsif üçün hesab yaradılacaq</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Prof. Elçin Babayev" />
            </div>
            <div className="space-y-2">
              <Label>E-poçt</Label>
              <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="elcin@mail.az" />
            </div>
            <div className="space-y-2">
              <Label>Parol</Label>
              <Input required type="password" minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 simvol" />
            </div>
            <div className="space-y-2">
              <Label>İxtisas / Kredensiallar</Label>
              <Input required value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Informatika professoru, ADA Universiteti" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Ləğv et</Button>
              <Button type="submit" disabled={submitting} className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white">
                {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                Dəvət et
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : jury.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Hələ heç bir münsif əlavə edilməyib</CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Münsif siyahısı</CardTitle>
            <CardDescription>Bütün münsiflər və onların məlumatları</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>E-poçt</TableHead>
                  <TableHead>Kredensiallar</TableHead>
                  <TableHead>Təyin olunmuş komandalar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jury.map(j => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#2EC4B6]/10 text-sm font-semibold text-[#2EC4B6]">{j.name.charAt(0)}</div>
                        {j.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{j.email}</TableCell>
                    <TableCell className="max-w-[200px] text-sm">{j.specialty}</TableCell>
                    <TableCell>
                      {j.assignedTeams.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {j.assignedTeams.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Hələ təyin olunmayıb</span>
                      )}
                    </TableCell>
                    <TableCell><Badge variant="default">Aktiv</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(j.id)}><Trash2 className="size-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
