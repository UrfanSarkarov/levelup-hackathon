import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  ClipboardList,
  Presentation,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import type { HackathonPhase, Team } from '@/types/app.types';

/* ── Phase display map ────────────────────────────────────── */
const PHASE_LABELS: Record<HackathonPhase, string> = {
  draft: 'Qaralama',
  registration_open: 'Qeydiyyat aciq',
  registration_closed: 'Qeydiyyat bagli',
  selection: 'Secim',
  training: 'Telim',
  sprint: 'Sprint',
  judging: 'Qiymetlendirme',
  completed: 'Tamamlandi',
  archived: 'Arxivlendi',
};

const PHASE_ORDER: HackathonPhase[] = [
  'draft',
  'registration_open',
  'registration_closed',
  'selection',
  'training',
  'sprint',
  'judging',
  'completed',
  'archived',
];

/* ── Mock data fallback ───────────────────────────────────── */
const MOCK_KPI = {
  registrations: 42,
  activeTeams: 12,
  participants: 58,
  submissions: 3,
};

interface MockTeamRow {
  id: string;
  name: string;
  status: Team['status'];
  created_at: string;
  member_count: number;
}

const MOCK_TEAMS: MockTeamRow[] = [
  { id: '1', name: 'CodeCrafters', status: 'accepted', created_at: '2026-03-28T14:00:00Z', member_count: 4 },
  { id: '2', name: 'InnoVision', status: 'pending', created_at: '2026-03-29T09:30:00Z', member_count: 3 },
  { id: '3', name: 'ByteBuilders', status: 'accepted', created_at: '2026-03-30T11:15:00Z', member_count: 5 },
  { id: '4', name: 'PixelPioneers', status: 'pending', created_at: '2026-03-31T16:45:00Z', member_count: 2 },
  { id: '5', name: 'DataDragons', status: 'rejected', created_at: '2026-03-31T18:00:00Z', member_count: 4 },
];

const MOCK_PHASE: HackathonPhase = 'registration_open';

/* ── Helper: status badge colour ──────────────────────────── */
function statusVariant(status: Team['status']) {
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

function statusLabel(status: Team['status']): string {
  const map: Record<Team['status'], string> = {
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
export default async function IdarePaneliPage() {
  let useMock = false;
  let kpi = MOCK_KPI;
  let recentTeams: MockTeamRow[] = MOCK_TEAMS;
  let currentPhase: HackathonPhase = MOCK_PHASE;

  try {
    const supabase = createServiceClient();

    // Fetch hackathon
    const { data: hackathon, error: hError } = await supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (hError || !hackathon) throw new Error('no hackathon');

    currentPhase = hackathon.current_phase as HackathonPhase;

    // Registrations count
    const { count: regCount } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', hackathon.id);

    // Active teams
    const { count: teamCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', hackathon.id)
      .in('status', ['accepted', 'active']);

    // Participants
    const { count: participantCount } = await supabase
      .from('team_members')
      .select('*, teams!inner(hackathon_id)', { count: 'exact', head: true })
      .eq('teams.hackathon_id', hackathon.id);

    // Submissions
    const { count: submissionCount } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', hackathon.id);

    kpi = {
      registrations: regCount ?? 0,
      activeTeams: teamCount ?? 0,
      participants: participantCount ?? 0,
      submissions: submissionCount ?? 0,
    };

    // Recent teams
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, status, created_at')
      .eq('hackathon_id', hackathon.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (teams && teams.length > 0) {
      recentTeams = teams.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status as Team['status'],
        created_at: t.created_at,
        member_count: 0,
      }));
    }
  } catch {
    useMock = true;
  }

  /* ── KPI cards data ───────────────────────────────────────── */
  const cards = [
    {
      label: 'Qeydiyyatlar',
      value: kpi.registrations,
      icon: ClipboardList,
      color: 'text-[#0D47A1]',
      bg: 'bg-[#0D47A1]/10',
    },
    {
      label: 'Aktiv Komandalar',
      value: kpi.activeTeams,
      icon: Users,
      color: 'text-[#2EC4B6]',
      bg: 'bg-[#2EC4B6]/10',
    },
    {
      label: 'Istirakcilar',
      value: kpi.participants,
      icon: UserCheck,
      color: 'text-[#6BBF6B]',
      bg: 'bg-[#6BBF6B]/10',
    },
    {
      label: 'Teqdimatlar',
      value: kpi.submissions,
      icon: Presentation,
      color: 'text-[#0D47A1]',
      bg: 'bg-[#0D47A1]/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Idare Paneli</h1>
        <p className="text-muted-foreground">
          Hackathon-un umumi veziyyetine baxin
        </p>
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

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="flex-row items-center justify-between">
                <CardDescription>{c.label}</CardDescription>
                <div className={`rounded-lg p-2 ${c.bg}`}>
                  <Icon className={`size-5 ${c.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{c.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom grid: recent registrations + phase status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Son Qeydiyyatlar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Son Qeydiyyatlar</CardTitle>
            <CardDescription>Sonuncu komanda qeydiyyatlari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#0D47A1]/10 text-sm font-semibold text-[#0D47A1]">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(team.created_at).toLocaleDateString('az-AZ', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(team.status)}>
                    {statusLabel(team.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Faza Statusu */}
        <Card>
          <CardHeader>
            <CardTitle>Faza Statusu</CardTitle>
            <CardDescription>Hackathon-un cari merehesi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PHASE_ORDER.map((phase) => {
                const isCurrent = phase === currentPhase;
                const currentIdx = PHASE_ORDER.indexOf(currentPhase);
                const phaseIdx = PHASE_ORDER.indexOf(phase);
                const isPast = phaseIdx < currentIdx;

                return (
                  <div
                    key={phase}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isCurrent
                        ? 'bg-[#0D47A1]/10 font-semibold text-[#0D47A1]'
                        : isPast
                          ? 'text-[#6BBF6B]'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="size-4 text-[#6BBF6B]" />
                    ) : isCurrent ? (
                      <Clock className="size-4 text-[#0D47A1]" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                    <span>{PHASE_LABELS[phase]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
