import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  UserCheck,
  Send,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Inbox,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
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
    href: '#',
  },
  {
    title: 'Mentor bron et',
    description: 'Mentorla gorusme vakti secin',
    icon: UserCheck,
    color: 'text-[#2EC4B6]',
    bg: 'bg-[#2EC4B6]/10',
    href: '#',
  },
  {
    title: 'Teqdimat gonder',
    description: 'Layihe teqdimatinizi yukleyin',
    icon: Send,
    color: 'text-[#6BBF6B]',
    bg: 'bg-[#6BBF6B]/10',
    href: '#',
  },
  {
    title: 'Bildirisler',
    description: 'Yeni bildirislerinize baxin',
    icon: Bell,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    href: '#',
  },
];

/* ── Mock notifications ───────────────────────────────────── */
interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  is_read: boolean;
}

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: '1',
    title: 'Qeydiyyat tesdiq edildi',
    message: 'Komandaniz hackathon-a qebul edildi.',
    type: 'success',
    created_at: '2026-03-30T10:00:00Z',
    is_read: false,
  },
  {
    id: '2',
    title: 'Yeni telim sessiyasi',
    message: 'React Advanced telimi 5 aprel tarixinde baslanir.',
    type: 'info',
    created_at: '2026-03-31T14:30:00Z',
    is_read: true,
  },
];

/* ── Page ─────────────────────────────────────────────────── */
export default async function KomandaDashboardPage() {
  let useMock = false;
  let currentPhase: string = 'registration_open';
  let teamName = 'Sizin Komandaniz';
  let notifications: MockNotification[] = MOCK_NOTIFICATIONS;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('no user');

    // Get hackathon phase
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('current_phase')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (hackathon) {
      currentPhase = hackathon.current_phase;
    }

    // Get team name
    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id, teams(name)')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (membership && typeof membership.teams === 'object' && membership.teams !== null && 'name' in membership.teams) {
      teamName = (membership.teams as { name: string }).name;
    }

    // Get notifications
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (notifs && notifs.length > 0) {
      notifications = notifs.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.body ?? '',
        type: n.type as MockNotification['type'],
        created_at: n.created_at,
        is_read: n.is_read,
      }));
    }
  } catch {
    useMock = true;
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

      {/* Mock-data banner */}
      {useMock && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Supabase baglantisi qurulmayib — demo melumatlar gosterilir
          </span>
        </div>
      )}

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

      {/* ── Quick actions ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className={`w-fit rounded-lg p-2.5 ${action.bg}`}>
                  <Icon className={`size-5 ${action.color}`} />
                </div>
                <CardTitle className="mt-2">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* ── Recent notifications ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Son bildirisler</CardTitle>
          <CardDescription>
            Sizin ucun olan bildirisler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="mb-2 size-10" />
              <p className="text-sm">Heç bir bildiris yoxdur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    !n.is_read ? 'bg-[#0D47A1]/5' : ''
                  }`}
                >
                  <div
                    className={`mt-0.5 size-2 shrink-0 rounded-full ${
                      n.type === 'success'
                        ? 'bg-[#6BBF6B]'
                        : n.type === 'warning'
                          ? 'bg-amber-400'
                          : n.type === 'error'
                            ? 'bg-red-400'
                            : 'bg-[#0D47A1]'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.is_read && (
                        <Badge variant="secondary" className="text-[10px]">
                          Yeni
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString('az-AZ', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
