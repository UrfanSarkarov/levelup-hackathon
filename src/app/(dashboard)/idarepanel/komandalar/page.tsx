import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Search } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import type { TeamStatus } from '@/types/app.types';
import { TeamActions } from './team-actions';

/* ── Mock data ────────────────────────────────────────────── */
interface TeamRow {
  id: string;
  name: string;
  status: TeamStatus;
  created_at: string;
  project_title: string | null;
  member_count: number;
  captain: string;
}

/* ── Helpers ──────────────────────────────────────────────── */
function statusVariant(status: TeamStatus) {
  switch (status) {
    case 'accepted':
    case 'active':
      return 'default' as const;
    case 'pending':
    case 'draft':
      return 'secondary' as const;
    case 'rejected':
    case 'disqualified':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

function statusLabel(status: TeamStatus): string {
  const map: Record<TeamStatus, string> = {
    draft: 'Qaralama',
    pending: 'Gozleyir',
    accepted: 'Qebul edildi',
    rejected: 'Redd edildi',
    waitlisted: 'Gozleme siyahisi',
    active: 'Aktiv',
    submitted: 'Gonderildi',
    disqualified: 'Diskvalifikasiya',
  };
  return map[status] ?? status;
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function KomandalarPage() {
  let teams: TeamRow[] = [];

  try {
    const supabase = createServiceClient();

    const { data: hackathon, error: hErr } = await supabase
      .from('hackathons')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (hErr || !hackathon) throw new Error('no hackathon');

    const { data: dbTeams, error: tErr } = await supabase
      .from('teams')
      .select('id, name, status, track, created_at, team_members(full_name, role)')
      .eq('hackathon_id', hackathon.id)
      .order('created_at', { ascending: false });

    if (tErr || !dbTeams || dbTeams.length === 0) throw new Error('no teams');

    // Also get submission titles
    const { data: subs } = await supabase
      .from('submissions')
      .select('team_id, title')
      .eq('hackathon_id', hackathon.id);

    const subMap = new Map((subs ?? []).map((s: { team_id: string; title: string }) => [s.team_id, s.title]));

    teams = dbTeams.map((t: { id: string; name: string; status: string; track: string | null; created_at: string; team_members: { full_name: string; role: string }[] }) => {
      const leader = t.team_members?.find((m) => m.role === 'leader');
      return {
        id: t.id,
        name: t.name,
        status: t.status as TeamStatus,
        created_at: t.created_at,
        project_title: subMap.get(t.id) ?? t.track ?? null,
        member_count: t.team_members?.length ?? 0,
        captain: leader?.full_name ?? '-',
      };
    });
  } catch {
    // leave defaults
  }

  const counts = {
    total: teams.length,
    pending: teams.filter((t) => t.status === 'pending').length,
    accepted: teams.filter((t) => t.status === 'accepted' || t.status === 'active').length,
    rejected: teams.filter((t) => t.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Komandalar</h1>
          <p className="text-muted-foreground">
            Butun komandalar ve onlarin statuslari
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#0D47A1]/10 px-3 py-2 text-sm font-medium text-[#0D47A1]">
          <Users className="size-4" />
          <span>{counts.total} komanda</span>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="size-2 rounded-full bg-amber-400" />
          Gozleyen: <span className="font-semibold">{counts.pending}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="size-2 rounded-full bg-[#6BBF6B]" />
          Qebul edilmis: <span className="font-semibold">{counts.accepted}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="size-2 rounded-full bg-red-400" />
          Redd edilmis: <span className="font-semibold">{counts.rejected}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Komanda axtarin..."
          className="pl-8"
          disabled
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Komanda siyahisi</CardTitle>
          <CardDescription>
            Qeydiyyatdan kecmis butun komandalar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Komanda adi</TableHead>
                <TableHead>Kapitan</TableHead>
                <TableHead>Layihe</TableHead>
                <TableHead className="text-center">Uzv sayi</TableHead>
                <TableHead>Qeydiyyat tarixi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Emeliyyat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Hec bir komanda tapilmadi
                  </TableCell>
                </TableRow>
              ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.captain}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {team.project_title ?? '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {team.member_count}
                  </TableCell>
                  <TableCell>
                    {new Date(team.created_at).toLocaleDateString('az-AZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(team.status)}>
                      {statusLabel(team.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <TeamActions teamId={team.id} status={team.status} />
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
