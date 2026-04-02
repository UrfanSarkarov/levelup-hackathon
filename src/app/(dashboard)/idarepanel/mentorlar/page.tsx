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
interface MentorRow {
  id: string;
  name: string;
  email: string;
  specialty: string;
  slotCount: number;
  status: 'active' | 'pending';
}

const MOCK_MENTORS: MentorRow[] = [
  {
    id: '1',
    name: 'Kamran Rzayev',
    email: 'kamran.r@mail.az',
    specialty: 'Startup Strategiyasi',
    slotCount: 8,
    status: 'active',
  },
  {
    id: '2',
    name: 'Narmin Ismayilova',
    email: 'narmin.i@mail.az',
    specialty: 'Mehsul Idareediciliyi',
    slotCount: 6,
    status: 'active',
  },
  {
    id: '3',
    name: 'Vugar Mammadov',
    email: 'vugar.m@mail.az',
    specialty: 'Texniki Arxitektura',
    slotCount: 4,
    status: 'active',
  },
  {
    id: '4',
    name: 'Ayten Quliyeva',
    email: 'ayten.q@mail.az',
    specialty: 'Marketinq ve Brendinq',
    slotCount: 0,
    status: 'pending',
  },
];

/* ── Helpers ──────────────────────────────────────────────── */
function statusVariant(status: MentorRow['status']) {
  return status === 'active' ? ('default' as const) : ('secondary' as const);
}

function statusLabel(status: MentorRow['status']): string {
  return status === 'active' ? 'Aktiv' : 'Gozleyir';
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function MentorlarPage() {
  let useMock = false;
  let mentors: MentorRow[] = MOCK_MENTORS;

  try {
    const supabase = createServiceClient();

    // Get all users with mentor role by joining user_roles -> profiles
    const { data: mentorRoles, error: rErr } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'mentor');

    if (rErr || !mentorRoles || mentorRoles.length === 0) throw new Error('no mentors');

    const mentorIds = mentorRoles.map((r: { user_id: string }) => r.user_id);

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, expertise_area, bio')
      .in('id', mentorIds);

    if (pErr || !profiles || profiles.length === 0) throw new Error('no mentor profiles');

    // Count mentoring sessions per mentor
    const { data: sessionCounts } = await supabase
      .from('sessions')
      .select('host_id')
      .eq('session_type', 'mentoring')
      .in('host_id', mentorIds);

    const slotMap = new Map<string, number>();
    (sessionCounts ?? []).forEach((s: { host_id: string }) => {
      slotMap.set(s.host_id, (slotMap.get(s.host_id) ?? 0) + 1);
    });

    mentors = profiles.map((p: { id: string; full_name: string | null; email: string; expertise_area: string | null; bio: string | null }) => ({
      id: p.id,
      name: p.full_name ?? p.email,
      email: p.email,
      specialty: p.expertise_area ?? '-',
      slotCount: slotMap.get(p.id) ?? 0,
      status: 'active' as const,
    }));
  } catch {
    useMock = true;
  }

  const activeCount = mentors.filter((m) => m.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentorlar</h1>
          <p className="text-muted-foreground">
            Komandalara rehberlik eden mentorlar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#2EC4B6]/10 px-3 py-2 text-sm font-medium text-[#2EC4B6]">
            <Users className="size-4" />
            <span>{mentors.length} mentor</span>
          </div>
          <Button className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white">
            <UserPlus className="size-4 mr-2" />
            Yeni mentor devet et
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
          <span className="font-semibold">{mentors.length - activeCount}</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mentor siyahisi</CardTitle>
          <CardDescription>
            Butun mentorlar ve onlarin melumatlari
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>E-poct</TableHead>
                <TableHead>Ixtisas sahesi</TableHead>
                <TableHead className="text-center">Slot sayi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentors.map((mentor) => (
                <TableRow key={mentor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#0D47A1]/10 text-sm font-semibold text-[#0D47A1]">
                        {mentor.name.charAt(0)}
                      </div>
                      {mentor.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mentor.email}
                  </TableCell>
                  <TableCell>{mentor.specialty}</TableCell>
                  <TableCell className="text-center">
                    {mentor.slotCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(mentor.status)}>
                      {statusLabel(mentor.status)}
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
