'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Users, UserPlus, Trash2, Loader2, Trophy, Plus } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { inviteJudge, deleteJudge, createJudgingRound } from './actions';

interface JuryRow {
  id: string;
  name: string;
  email: string;
  specialty: string;
  assignedTeams: string[];
}

interface TeamOption {
  id: string;
  name: string;
  track: string;
}

export default function MunsiflerPage() {
  const [jury, setJury] = useState<JuryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', specialty: '' });

  // Round creation
  const [roundDialogOpen, setRoundDialogOpen] = useState(false);
  const [roundName, setRoundName] = useState('Final Raund');
  const [acceptedTeams, setAcceptedTeams] = useState<TeamOption[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [roundPending, startRoundTransition] = useTransition();
  const [roundError, setRoundError] = useState('');
  const [activeRoundName, setActiveRoundName] = useState<string | null>(null);

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

      // Check active round
      const { data: activeRound } = await supabase
        .from('judging_rounds')
        .select('name')
        .eq('is_active', true)
        .limit(1)
        .single();
      setActiveRoundName(activeRound?.name ?? null);
    } catch {
      setJury([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadJury(); }, []);

  const loadAcceptedTeams = async () => {
    try {
      const res = await fetch('/api/admin/accepted-teams');
      const data = await res.json();
      setAcceptedTeams(data.teams ?? []);
    } catch {
      setAcceptedTeams([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await inviteJudge(form);
    if (res.error) { setError(res.error); setSubmitting(false); return; }
    setDialogOpen(false);
    setForm({ fullName: '', email: '', password: '', specialty: '' });
    setSubmitting(false);
    loadJury();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu munsifi silmek isteyirsiniz?')) return;
    await deleteJudge(id);
    loadJury();
  };

  const openRoundDialog = () => {
    setRoundError('');
    setSelectedTeamIds(new Set());
    loadAcceptedTeams();
    setRoundDialogOpen(true);
  };

  const handleCreateRound = () => {
    if (selectedTeamIds.size === 0) { setRoundError('En az 1 komanda secilmelidir'); return; }
    startRoundTransition(async () => {
      const result = await createJudgingRound({
        name: roundName,
        teamIds: Array.from(selectedTeamIds),
      });
      if (result.error) { setRoundError(result.error); return; }
      setRoundDialogOpen(false);
      loadJury();
    });
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId); else next.add(teamId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Munsiflər</h1>
          <p className="text-muted-foreground">Layiheleri qiymetlendiren munsif heyeti</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#0D47A1]/10 px-3 py-2 text-sm font-medium text-[#0D47A1]">
            <Users className="size-4" />
            <span>{jury.length} munsif</span>
          </div>
          <Button className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white" onClick={() => setDialogOpen(true)}>
            <UserPlus className="size-4 mr-2" /> Yeni munsif devet et
          </Button>
        </div>
      </div>

      {/* Invite judge dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni munsif devet et</DialogTitle>
            <DialogDescription>Munsif ucun hesab yaradilacaq</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Prof. Elcin Babayev" />
            </div>
            <div className="space-y-2">
              <Label>E-poct</Label>
              <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="elcin@mail.az" />
            </div>
            <div className="space-y-2">
              <Label>Parol</Label>
              <Input required type="password" minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 simvol" />
            </div>
            <div className="space-y-2">
              <Label>Ixtisas</Label>
              <Input required value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Informatika professoru" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Legv et</Button>
              <Button type="submit" disabled={submitting} className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white">
                {submitting && <Loader2 className="size-4 mr-2 animate-spin" />} Devet et
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Judges table */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : jury.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Hele hec bir munsif elave edilmeyib</CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Munsif siyahisi</CardTitle>
            <CardDescription>Butun munsiflər ve onlarin melumatlari</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>E-poct</TableHead>
                  <TableHead>Ixtisas</TableHead>
                  <TableHead>Teyin olunmus komandalar</TableHead>
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
                        <span className="text-sm text-muted-foreground">Hele teyin olunmayib</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(j.id)}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Judging Round Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-5 text-amber-500" />
                Qiymetlendirme Raundu
              </CardTitle>
              <CardDescription>
                Finalist komandalari secin ve qiymetlendirme raundunu basladin
              </CardDescription>
            </div>
            <Button onClick={openRoundDialog} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="size-4 mr-2" /> Raund yarat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeRoundName ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <Trophy className="size-5 text-amber-500" />
              <div>
                <p className="font-semibold text-green-800">Aktiv raund: {activeRoundName}</p>
                <p className="text-sm text-green-700">Munsiflər komandalari qiymetlendire biler</p>
              </div>
              <Badge className="ml-auto bg-green-600 text-white">Aktiv</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Hele qiymetlendirme raundu yaradilmayib. Yuxaridaki &quot;Raund yarat&quot; duymesine basin.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create round dialog */}
      <Dialog open={roundDialogOpen} onOpenChange={setRoundDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Qiymetlendirme Raundu Yarat</DialogTitle>
            <DialogDescription>Finalist komandalari secin. Butun munsiflere teyin olunacaq.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Raund adi</Label>
              <Input value={roundName} onChange={e => setRoundName(e.target.value)} placeholder="Final Raund" />
            </div>

            <div className="space-y-2">
              <Label>Finalist komandalari secin ({selectedTeamIds.size} secildi)</Label>
              <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg border p-3">
                {acceptedTeams.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Qebul edilmis komanda yoxdur</p>
                ) : (
                  acceptedTeams.map(team => (
                    <label key={team.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer">
                      <Checkbox
                        checked={selectedTeamIds.has(team.id)}
                        onCheckedChange={() => toggleTeam(team.id)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{team.name}</span>
                        <Badge variant="outline" className="text-[10px]">{team.track}</Badge>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {roundError && <p className="text-sm text-red-500">{roundError}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRoundDialogOpen(false)}>Legv et</Button>
              <Button onClick={handleCreateRound} disabled={roundPending} className="bg-amber-500 hover:bg-amber-600 text-white">
                {roundPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                {selectedTeamIds.size} komanda ile raund yarat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
