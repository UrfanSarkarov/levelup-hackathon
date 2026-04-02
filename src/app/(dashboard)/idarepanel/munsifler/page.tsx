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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, AlertTriangle, UserPlus } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';

/* ── Mock data ────────────────────────────────────────────── */
interface JuryRow {
  id: string;
  name: string;
  email: string;
  credentials: string;
  assignedTeams: string[];
  status: 'active' | 'pending';
}

const MOCK_JURY: JuryRow[] = [
  {
    id: '1',
    name: 'Prof. Elcin Babayev',
    email: 'elcin.b@adu.edu.az',
    credentials: 'Informatika professoru, ADA Universiteti',
    assignedTeams: ['CodeCrafters', 'ByteBuilders', 'CloudNine'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Lamiya Novruzova',
    email: 'lamiya.n@techaz.com',
    credentials: 'CTO, TechAz MMC',
    assignedTeams: ['InnoVision', 'DataDragons'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Dr. Samir Karimov',
    email: 'samir.k@bsu.edu.az',
    credentials: 'Suuni intellekt uzre tedqiqatci, BSU',
    assignedTeams: [],
    status: 'pending',
  },
];

/* ── Helpers ──────────────────────────────────────────────── */
function statusVariant(status: JuryRow['status']) {
  return status === 'active' ? ('default' as const) : ('secondary' as const);
}

function statusLabel(status: JuryRow['status']): string {
  return status === 'active' ? 'Aktiv' : 'Gozleyir';
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function MunsiflerPage() {
  let useMock = false;
  let jury: JuryRow[] = MOCK_JURY;

  try {
    const supabase = createServiceClient();

    // Get all users with jury role
    const { data: juryRoles, error: rErr } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'jury');

    if (rErr || !juryRoles || juryRoles.length === 0) throw new Error('no jury');

    const juryIds = juryRoles.map((r: { user_id: string }) => r.user_id);

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, credentials, expertise_area')
      .in('id', juryIds);

    if (pErr || !profiles || profiles.length === 0) throw new Error('no jury profiles');

    // Get judge assignments with team names
    const { data: assignments } = await supabase
      .from('judge_assignments')
      .select('judge_id, team_id, teams(name)')
      .in('judge_id', juryIds);

    const teamMap = new Map<string, string[]>();
    (assignments ?? []).forEach((a: { judge_id: string; team_id: string; teams: { name: string }[] | { name: string } | null }) => {
      const list = teamMap.get(a.judge_id) ?? [];
      const teamObj = Array.isArray(a.teams) ? a.teams[0] : a.teams;
      if (teamObj?.name) list.push(teamObj.name);
      teamMap.set(a.judge_id, list);
    });

    jury = profiles.map((p: { id: string; full_name: string | null; email: string; credentials: Record<string, unknown> | null; expertise_area: string | null }) => ({
      id: p.id,
      name: p.full_name ?? p.email,
      email: p.email,
      credentials: p.expertise_area ?? (typeof p.credentials === 'object' && p.credentials !== null ? JSON.stringify(p.credentials) : '-'),
      assignedTeams: teamMap.get(p.id) ?? [],
      status: 'active' as const,
    }));
  } catch {
    useMock = true;
  }

  const activeCount = jury.filter((j) => j.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Munsifler</h1>
          <p className="text-muted-foreground">
            Layiheleri qiymetlendiren munsif heyeti
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#0D47A1]/10 px-3 py-2 text-sm font-medium text-[#0D47A1]">
            <Users className="size-4" />
            <span>{jury.length} munsif</span>
          </div>
          <Button className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white">
            <UserPlus className="size-4 mr-2" />
            Yeni munsif devet et
          </Button>
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
          <span className="size-2 rounded-full bg-[#6BBF6B]" />
          Aktiv: <span className="font-semibold">{activeCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="size-2 rounded-full bg-amber-400" />
          Gozleyen:{' '}
          <span className="font-semibold">{jury.length - activeCount}</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Munsif siyahisi</CardTitle>
          <CardDescription>
            Butun munsifler ve onlarin melumatlari
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>E-poct</TableHead>
                <TableHead>Kredensiallar</TableHead>
                <TableHead>Teyin olunmus komandalar</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jury.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#2EC4B6]/10 text-sm font-semibold text-[#2EC4B6]">
                        {member.name.charAt(0)}
                      </div>
                      {member.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm">{member.credentials}</span>
                  </TableCell>
                  <TableCell>
                    {member.assignedTeams.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.assignedTeams.map((team) => (
                          <Badge
                            key={team}
                            variant="outline"
                            className="text-xs"
                          >
                            {team}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Henuz teyin olunmayib
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(member.status)}>
                      {statusLabel(member.status)}
                    </Badge>
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
