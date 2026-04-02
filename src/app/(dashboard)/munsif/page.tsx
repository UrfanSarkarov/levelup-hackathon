import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  Users,
  BarChart3,
  ClipboardCheck,
  Inbox,
  Star,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface JudgingRound {
  id: string;
  name: string;
  round_number: number;
  is_active: boolean;
}

interface Assignment {
  id: string;
  team_name: string;
  is_completed: boolean;
  score: number | null;
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function MunsifDashboardPage() {
  let activeRound: JudgingRound | null = null;
  let assignments: Assignment[] = [];
  let totalAssigned = 0;
  let totalCompleted = 0;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('no user');

    // Get active round
    const { data: round } = await supabase
      .from('judging_rounds')
      .select('*')
      .eq('is_active', true)
      .order('round_number', { ascending: true })
      .limit(1)
      .single();

    if (round) {
      activeRound = {
        id: round.id,
        name: round.name,
        round_number: round.round_number,
        is_active: round.is_active,
      };

      // Get assignments for this judge in this round
      const { data: judgeAssignments } = await supabase
        .from('judge_assignments')
        .select('id, team_id, is_completed, teams(name)')
        .eq('round_id', round.id)
        .eq('judge_id', user.id);

      if (judgeAssignments && judgeAssignments.length > 0) {
        assignments = judgeAssignments.map((a) => ({
          id: a.id,
          team_name:
            typeof a.teams === 'object' && a.teams !== null && 'name' in a.teams
              ? (a.teams as { name: string }).name
              : 'Namelum komanda',
          is_completed: a.is_completed,
          score: null,
        }));
        totalAssigned = assignments.length;
        totalCompleted = assignments.filter((a) => a.is_completed).length;
      }
    }
  } catch {
    // Supabase connection failed — show empty state
  }

  /* ── KPI cards ──────────────────────────────────────────── */
  const kpiCards = [
    {
      label: 'Teyin olunmus komandalar',
      value: totalAssigned,
      icon: Users,
      color: 'text-[#0D47A1]',
      bg: 'bg-[#0D47A1]/10',
    },
    {
      label: 'Qiymetlendirilmis',
      value: totalCompleted,
      icon: ClipboardCheck,
      color: 'text-[#6BBF6B]',
      bg: 'bg-[#6BBF6B]/10',
    },
    {
      label: 'Gozleyen',
      value: totalAssigned - totalCompleted,
      icon: BarChart3,
      color: 'text-[#2EC4B6]',
      bg: 'bg-[#2EC4B6]/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <Scale className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Qiymetlendirme Paneli
          </h1>
          <p className="text-muted-foreground">
            Munsif qiymetlendirme idareetmesi
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpiCards.map((c) => {
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

      {/* Active round info */}
      <Card>
        <CardHeader>
          <CardTitle>Aktiv tur</CardTitle>
          <CardDescription>
            Hazirda davam eden qiymetlendirme turu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeRound ? (
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#0D47A1]/10 text-lg font-bold text-[#0D47A1]">
                {activeRound.round_number}
              </div>
              <div>
                <p className="font-semibold">{activeRound.name}</p>
                <p className="text-sm text-muted-foreground">
                  Tur {activeRound.round_number}
                </p>
              </div>
              <Badge
                variant={activeRound.is_active ? 'default' : 'secondary'}
                className={
                  activeRound.is_active ? 'bg-[#6BBF6B] text-white' : ''
                }
              >
                {activeRound.is_active ? 'Aktiv' : 'Gozleyir'}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Hazirda aktiv tur yoxdur
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scoring interface placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" />
            <CardTitle>Qiymetlendirme</CardTitle>
          </div>
          <CardDescription>
            Teyin olunmus komandalari qiymetlendirin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Inbox className="mb-3 size-12" />
              <p className="font-medium">
                Hec bir komanda teyin olunmayib
              </p>
              <p className="mt-1 text-xs">
                Qiymetlendirme baslayanda burada komandalar gorunecek
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#2EC4B6]/10 text-sm font-semibold text-[#2EC4B6]">
                      {a.team_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{a.team_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.is_completed
                          ? 'Qiymetlendirildi'
                          : 'Qiymetlendirme gozleyir'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={a.is_completed ? 'default' : 'outline'}
                    className={
                      a.is_completed ? 'bg-[#6BBF6B] text-white' : ''
                    }
                  >
                    {a.is_completed ? 'Tamamlandi' : 'Gozleyir'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
