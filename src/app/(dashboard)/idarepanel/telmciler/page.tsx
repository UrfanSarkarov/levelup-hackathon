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
interface TrainerRow {
  id: string;
  name: string;
  email: string;
  specialty: string;
  sessionCount: number;
  status: 'active' | 'pending';
}

const MOCK_TRAINERS: TrainerRow[] = [
  {
    id: '1',
    name: 'Farid Abdullayev',
    email: 'farid.abdullayev@mail.az',
    specialty: 'Frontend Development',
    sessionCount: 5,
    status: 'active',
  },
  {
    id: '2',
    name: 'Gunay Mammadova',
    email: 'gunay.m@mail.az',
    specialty: 'UI/UX Dizayn',
    sessionCount: 3,
    status: 'active',
  },
  {
    id: '3',
    name: 'Orkhan Huseynov',
    email: 'orkhan.h@mail.az',
    specialty: 'Backend Development',
    sessionCount: 4,
    status: 'active',
  },
  {
    id: '4',
    name: 'Sevda Aliyeva',
    email: 'sevda.a@mail.az',
    specialty: 'Data Science',
    sessionCount: 0,
    status: 'pending',
  },
  {
    id: '5',
    name: 'Rashad Hasanli',
    email: 'rashad.h@mail.az',
    specialty: 'DevOps & Cloud',
    sessionCount: 2,
    status: 'active',
  },
];

/* ── Helpers ──────────────────────────────────────────────── */
function statusVariant(status: TrainerRow['status']) {
  return status === 'active' ? ('default' as const) : ('secondary' as const);
}

function statusLabel(status: TrainerRow['status']): string {
  return status === 'active' ? 'Aktiv' : 'Gozleyir';
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function TelmcilerPage() {
  let useMock = false;
  let trainers: TrainerRow[] = MOCK_TRAINERS;

  try {
    const supabase = createServiceClient();

    // Get all users with trainer role
    const { data: trainerRoles, error: rErr } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'trainer');

    if (rErr || !trainerRoles || trainerRoles.length === 0) throw new Error('no trainers');

    const trainerIds = trainerRoles.map((r: { user_id: string }) => r.user_id);

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, expertise_area')
      .in('id', trainerIds);

    if (pErr || !profiles || profiles.length === 0) throw new Error('no trainer profiles');

    // Count training sessions per trainer
    const { data: sessionCounts } = await supabase
      .from('sessions')
      .select('host_id')
      .eq('session_type', 'training')
      .in('host_id', trainerIds);

    const sessionMap = new Map<string, number>();
    (sessionCounts ?? []).forEach((s: { host_id: string }) => {
      sessionMap.set(s.host_id, (sessionMap.get(s.host_id) ?? 0) + 1);
    });

    trainers = profiles.map((p: { id: string; full_name: string | null; email: string; expertise_area: string | null }) => ({
      id: p.id,
      name: p.full_name ?? p.email,
      email: p.email,
      specialty: p.expertise_area ?? '-',
      sessionCount: sessionMap.get(p.id) ?? 0,
      status: 'active' as const,
    }));
  } catch {
    useMock = true;
  }

  const activeCount = trainers.filter((t) => t.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Telimciler</h1>
          <p className="text-muted-foreground">
            Telim sessiyalarini aparan mutexessisler
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#0D47A1]/10 px-3 py-2 text-sm font-medium text-[#0D47A1]">
            <Users className="size-4" />
            <span>{trainers.length} telimci</span>
          </div>
          <Button className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white">
            <UserPlus className="size-4 mr-2" />
            Yeni telimci devet et
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
          <span className="font-semibold">{trainers.length - activeCount}</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Telimci siyahisi</CardTitle>
          <CardDescription>
            Butun telimciler ve onlarin melumatla ri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>E-poct</TableHead>
                <TableHead>Ixtisas sahesi</TableHead>
                <TableHead className="text-center">Sessiya sayi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#2EC4B6]/10 text-sm font-semibold text-[#2EC4B6]">
                        {trainer.name.charAt(0)}
                      </div>
                      {trainer.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {trainer.email}
                  </TableCell>
                  <TableCell>{trainer.specialty}</TableCell>
                  <TableCell className="text-center">
                    {trainer.sessionCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(trainer.status)}>
                      {statusLabel(trainer.status)}
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
