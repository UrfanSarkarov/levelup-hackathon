import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GraduationCap,
  UserCheck,
  Send,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
} from 'lucide-react';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { HackathonPhase } from '@/types/app.types';

/* ── Stepper phases ───────────────────────────────────────── */
interface StepperPhase {
  key: HackathonPhase | string;
  label: string;
}

const STEPPER_PHASES: StepperPhase[] = [
  { key: 'registration_open', label: 'Qeydiyyat' },
  { key: 'selection', label: 'Secim' },
  { key: 'training', label: 'Telim' },
  { key: 'sprint', label: 'Sprint' },
  { key: 'judging', label: 'Teqdimat' },
];

/* ── Quick actions ────────────────────────────────────────── */
interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  href: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Telime yazil',
    description: 'Movcud telim sessiyalarina qosulun',
    icon: GraduationCap,
    color: 'text-[#0D47A1]',
    bg: 'bg-[#0D47A1]/10',
    href: '/komanda/telimler',
  },
  {
    title: 'Mentor bron et',
    description: 'Mentorla gorusme vakti secin',
    icon: UserCheck,
    color: 'text-[#2EC4B6]',
    bg: 'bg-[#2EC4B6]/10',
    href: '/komanda/mentorluq',
  },
  {
    title: 'Teqdimat gonder',
    description: 'Layihe teqdimatinizi yukleyin',
    icon: Send,
    color: 'text-[#6BBF6B]',
    bg: 'bg-[#6BBF6B]/10',
    href: '/komanda/teqdimat',
  },
];

/* ── Page ─────────────────────────────────────────────────── */
export default async function KomandaDashboardPage() {
  let currentPhase: string = 'registration_open';
  let teamName = 'Sizin Komandaniz';
  let teamStatus: string = 'pending';

  try {
    const supabase = await createClient();
    const serviceClient = createServiceClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('no user');

    // Get hackathon phase (use service client to bypass RLS)
    const { data: hackathon } = await serviceClient
      .from('hackathons')
      .select('current_phase')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (hackathon) {
      currentPhase = hackathon.current_phase;
    }

    // Get team name and status (use service client to bypass RLS)
    const { data: membership } = await serviceClient
      .from('team_members')
      .select('team_id, teams(name, status)')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (membership && typeof membership.teams === 'object' && membership.teams !== null) {
      const team = membership.teams as unknown as { name: string; status: string };
      teamName = team.name;
      teamStatus = team.status;
    }
  } catch {
    // Supabase connection failed — show empty state
  }

  /* ── Phase stepper index ──────────────────────────────────── */
  const currentStepIdx = STEPPER_PHASES.findIndex(
    (p) => p.key === currentPhase
  );
  const activeIdx = currentStepIdx >= 0 ? currentStepIdx : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Komanda Paneli</h1>
        <p className="text-muted-foreground">{teamName}</p>
      </div>

      {/* ── Status stepper ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Hackathon merehesi</CardTitle>
          <CardDescription>
            Komandanizin hazirki veziyyeti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {STEPPER_PHASES.map((phase, idx) => {
              const isPast = idx < activeIdx;
              const isCurrent = idx === activeIdx;

              return (
                <div key={phase.key} className="flex flex-1 items-center">
                  {/* Step circle + label */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex size-9 items-center justify-center rounded-full border-2 transition-colors ${
                        isPast
                          ? 'border-[#6BBF6B] bg-[#6BBF6B] text-white'
                          : isCurrent
                            ? 'border-[#0D47A1] bg-[#0D47A1]/10 text-[#0D47A1]'
                            : 'border-muted-foreground/30 text-muted-foreground/50'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="size-5" />
                      ) : isCurrent ? (
                        <Clock className="size-5" />
                      ) : (
                        <Circle className="size-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent
                          ? 'text-[#0D47A1]'
                          : isPast
                            ? 'text-[#6BBF6B]'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {phase.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {idx < STEPPER_PHASES.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        idx < activeIdx ? 'bg-[#6BBF6B]' : 'bg-muted-foreground/20'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Rejected team banner ─────────────────────────────── */}
      {teamStatus === 'rejected' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 py-6">
            <XCircle className="size-8 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Komandaniz bu defe secilmedi</p>
              <p className="text-sm text-red-600">
                Gelecek tedbirlerde sizi gormek umidi ile! Suallariniz ucun biziml&#601; elaq&#601; saxlayin.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Quick actions ──────────────────────────────────────── */}
      {teamStatus !== 'rejected' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className={`w-fit rounded-lg p-2.5 ${action.bg}`}>
                      <Icon className={`size-5 ${action.color}`} />
                    </div>
                    <CardTitle className="mt-2">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
