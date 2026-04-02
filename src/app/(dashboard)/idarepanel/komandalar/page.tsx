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
import { Users, AlertTriangle, Search } from 'lucide-react';
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

const MOCK_TEAMS: TeamRow[] = [
  {
    id: '1',
    name: 'CodeCrafters',
    status: 'accepted',
    created_at: '2026-03-28T14:00:00Z',
    project_title: 'EcoTrack',
    member_count: 4,
    captain: 'Elvin Memmedov',
  },
  {
    id: '2',
    name: 'InnoVision',
    status: 'pending',
    created_at: '2026-03-29T09:30:00Z',
    project_title: null,
    member_count: 3,
    captain: 'Nigar Huseynova',
  },
  {
    id: '3',
    name: 'ByteBuilders',
    status: 'accepted',
    created_at: '2026-03-30T11:15:00Z',
    project_title: 'HealthHub',
    member_count: 5,
    captain: 'Ruslan Aliyev',
  },
  {
    id: '4',
    name: 'PixelPioneers',
    status: 'pending',
    created_at: '2026-03-31T16:45:00Z',
    project_title: null,
    member_count: 2,
    captain: 'Leyla Qasimova',
  },
  {
    id: '5',
    name: 'DataDragons',
    status: 'rejected',
    created_at: '2026-03-31T18:00:00Z',
    project_title: 'SmartFarm',
    member_count: 4,
    captain: 'Tural Hasanov',
  },
  {
    id: '6',
    name: 'CloudNine',
    status: 'accepted',
    created_at: '2026-03-27T10:00:00Z',
    project_title: 'EduBridge',
    member_count: 3,
    captain: 'Kamran Rzayev',
  },
  {
    id: '7',
    name: 'AlgoStars',
    status: 'pending',
    created_at: '2026-04-01T08:20:00Z',
    project_title: null,
    member_count: 4,
    captain: 'Aysel Maharramova',
  },
];

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
  let useMock = false;
  let teams: TeamRow[] = MOCK_TEAMS;

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
    useMock = true;
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

      {/* Mock-data banner */}
      {useMock && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Supabase baglantisi qurulmayib — demo melumatlar gosterilir
          </span>
        </div>
      )}

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
              {teams.map((team) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
