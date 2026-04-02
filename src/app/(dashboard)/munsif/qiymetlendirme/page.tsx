'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Scale,
  Star,
  Users,
  ChevronRight,
  Lock,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AssignedTeam {
  id: string;
  name: string;
  track: string;
  scoredCriteria: number;
  totalCriteria: number;
}

interface ScoringCriterion {
  id: string;
  name: string;
  maxScore: number;
  description: string;
}

const SCORING_CRITERIA: ScoringCriterion[] = [
  {
    id: 'c1',
    name: 'Problemin aydinliqi',
    maxScore: 10,
    description: 'Komanda heqiqi bir problemi duzgun identifikasiya edibmi?',
  },
  {
    id: 'c2',
    name: 'Hellin innovativliyi',
    maxScore: 10,
    description: 'Teklif olunan hell movcud hellerden ne ile ferqlenir?',
  },
  {
    id: 'c3',
    name: 'Texniki icra imkani',
    maxScore: 10,
    description: 'Hellin texniki olaraq heyata kecirilmesi mumkundurmu?',
  },
  {
    id: 'c4',
    name: 'Potensial tesir',
    maxScore: 10,
    description: 'Layihenin potensial tesiri ne qeder boyukdur?',
  },
  {
    id: 'c5',
    name: 'Hedef auditoriya',
    maxScore: 10,
    description: 'Hedef auditoriya duzgun mueyyen olunubmu?',
  },
  {
    id: 'c6',
    name: 'Biznes modeli',
    maxScore: 10,
    description: 'Biznes modeli ve ya davamlilig plani varmi?',
  },
  {
    id: 'c7',
    name: 'Teqdimat keyfiyyeti',
    maxScore: 10,
    description: 'Komandanin teqdimati ne qeder aydin ve inandiricidur?',
  },
  {
    id: 'c8',
    name: 'Prototip ve demo',
    maxScore: 10,
    description: 'Prototip ve ya demo ne qeder funksionaldir?',
  },
  {
    id: 'c9',
    name: 'Inkisaf potensiali',
    maxScore: 10,
    description: 'Layihenin inkisaf potensiali (scalability) necedir?',
  },
];

/* ── Page ────────────────────────────────────────────────── */
export default function QiymetlendirmePage() {
  const [teams, setTeams] = useState<AssignedTeam[]>([]);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(SCORING_CRITERIA);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<AssignedTeam | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('no user');
        setUserId(user.id);

        // Get active judging round
        const { data: activeRound } = await supabase
          .from('judging_rounds')
          .select('*')
          .eq('is_active', true)
          .order('round_number', { ascending: true })
          .limit(1)
          .single();

        if (!activeRound) throw new Error('no active round');
        setActiveRoundId(activeRound.id);

        // Get judge assignments with team info
        const { data: assignments } = await supabase
          .from('judge_assignments')
          .select('id, team_id, is_completed, teams(name, track)')
          .eq('round_id', activeRound.id)
          .eq('judge_id', user.id);

        if (!assignments || assignments.length === 0)
          throw new Error('no assignments');

        // Try to load scoring criteria
        try {
          const { data: dbCriteria } = await supabase
            .from('scoring_criteria')
            .select('id, name, max_score, description');

          if (dbCriteria && dbCriteria.length > 0) {
            setCriteria(
              dbCriteria.map((c) => ({
                id: c.id,
                name: c.name,
                maxScore: c.max_score,
                description: c.description || '',
              }))
            );
          }
        } catch {
          // scoring_criteria table may not exist, keep defaults
        }

        // Get the effective criteria for counting
        const effectiveCriteria = criteria;

        // For each assignment, check how many criteria are scored
        const loadedTeams: AssignedTeam[] = await Promise.all(
          assignments.map(async (a) => {
            const rawTeams = a.teams;
            const teamData =
              Array.isArray(rawTeams) && rawTeams.length > 0
                ? { name: rawTeams[0].name as string, track: rawTeams[0].track as string }
                : typeof rawTeams === 'object' && rawTeams !== null && !Array.isArray(rawTeams)
                  ? (rawTeams as unknown as { name: string; track: string })
                  : { name: 'Namelum komanda', track: '' };

            let scoredCount = 0;
            try {
              const { data: existingScores } = await supabase
                .from('scores')
                .select('id')
                .eq('judge_id', user.id)
                .eq('team_id', a.team_id)
                .eq('round_id', activeRound.id);

              scoredCount = existingScores?.length ?? 0;
            } catch {
              // scores table may not exist yet
            }

            return {
              id: a.team_id,
              name: teamData.name,
              track: teamData.track,
              scoredCriteria: a.is_completed
                ? effectiveCriteria.length
                : scoredCount,
              totalCriteria: effectiveCriteria.length,
            };
          })
        );

        setTeams(loadedTeams);
      } catch {
        // Supabase error — teams remain empty
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load existing scores when a team is selected
  async function handleSelectTeam(team: AssignedTeam) {
    setSelectedTeam(team);
    setSaveMessage(null);

    // Initialize empty scores
    const emptyScores: Record<string, number> = {};
    criteria.forEach((c) => {
      emptyScores[c.id] = 0;
    });
    setScores(emptyScores);

    if (userId && activeRoundId) {
      try {
        const supabase = createClient();
        const { data: existingScores } = await supabase
          .from('scores')
          .select('criterion_id, score')
          .eq('judge_id', userId)
          .eq('team_id', team.id)
          .eq('round_id', activeRoundId);

        if (existingScores && existingScores.length > 0) {
          const loaded: Record<string, number> = { ...emptyScores };
          existingScores.forEach((s) => {
            loaded[s.criterion_id] = s.score;
          });
          setScores(loaded);
        }
      } catch {
        // scores table may not exist, keep empty scores
      }
    }
  }

  function handleScoreChange(criterionId: string, value: number, maxScore: number) {
    const clamped = Math.max(0, Math.min(maxScore, value));
    setScores((prev) => ({ ...prev, [criterionId]: clamped }));
  }

  async function handleSaveScores() {
    if (!selectedTeam) return;
    setSaving(true);
    setSaveMessage(null);

    if (!userId || !activeRoundId) {
      setSaving(false);
      setSaveMessage('Istifadeci ve ya raund melumati tapilmadi');
      return;
    }

    try {
      const supabase = createClient();

      for (const criterion of criteria) {
        await supabase.from('scores').upsert(
          {
            judge_id: userId,
            team_id: selectedTeam.id,
            round_id: activeRoundId,
            criterion_id: criterion.id,
            score: scores[criterion.id] ?? 0,
          },
          { onConflict: 'judge_id,team_id,round_id,criterion_id' }
        );
      }

      // Update scored criteria count in local state
      const scoredCount = Object.values(scores).filter((v) => v > 0).length;
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id
            ? { ...t, scoredCriteria: scoredCount }
            : t
        )
      );

      setSaveMessage('Qaralama ugurla saxlanildi');
    } catch {
      setSaveMessage('Xeta bas verdi');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitScores() {
    if (!selectedTeam) return;
    setSubmitting(true);
    setSaveMessage(null);

    if (!userId || !activeRoundId) {
      setSubmitting(false);
      setSaveMessage('Istifadeci ve ya raund melumati tapilmadi');
      return;
    }

    try {
      const supabase = createClient();

      // Save all scores first
      for (const criterion of criteria) {
        await supabase.from('scores').upsert(
          {
            judge_id: userId,
            team_id: selectedTeam.id,
            round_id: activeRoundId,
            criterion_id: criterion.id,
            score: scores[criterion.id] ?? 0,
          },
          { onConflict: 'judge_id,team_id,round_id,criterion_id' }
        );
      }

      // Mark assignment as completed
      await supabase
        .from('judge_assignments')
        .update({ is_completed: true })
        .eq('judge_id', userId)
        .eq('team_id', selectedTeam.id)
        .eq('round_id', activeRoundId);

      // Update local state
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id
            ? { ...t, scoredCriteria: t.totalCriteria }
            : t
        )
      );
      setSelectedTeam((prev) =>
        prev ? { ...prev, scoredCriteria: prev.totalCriteria } : null
      );

      setSaveMessage('Qiymetlendirme ugurla gonderildi!');
    } catch {
      setSaveMessage('Xeta bas verdi');
    } finally {
      setSubmitting(false);
    }
  }

  const totalScore = criteria.reduce(
    (sum, c) => sum + (scores[c.id] ?? 0),
    0
  );
  const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <Scale className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Qiymetlendirme
          </h1>
          <p className="text-muted-foreground">
            Teyin olunmus komandalari qiymetlendirin
          </p>
        </div>
      </div>

      {/* Assigned teams list */}
      <Card>
        <CardHeader>
          <CardTitle>Teyin olunmus komandalar</CardTitle>
          <CardDescription>
            Qiymetlendirme prosesini basladin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                Hec bir komanda teyin olunmayib
              </p>
            )}
            {teams.map((team) => {
              const progressPercent = Math.round(
                (team.scoredCriteria / team.totalCriteria) * 100
              );
              const isComplete = team.scoredCriteria === team.totalCriteria;
              const isSelected = selectedTeam?.id === team.id;

              return (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                    isSelected ? 'border-[#0D47A1] bg-[#0D47A1]/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#2EC4B6]/10 text-sm font-bold text-[#2EC4B6]">
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{team.name}</p>
                        <Badge variant="outline">{team.track}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={progressPercent} className="h-2 w-32" />
                        <span className="text-xs text-muted-foreground">
                          {team.scoredCriteria} / {team.totalCriteria} meyar
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        isComplete
                          ? 'bg-[#6BBF6B] text-white'
                          : team.scoredCriteria > 0
                            ? 'bg-amber-500 text-white'
                            : ''
                      }
                      variant={team.scoredCriteria === 0 ? 'secondary' : 'default'}
                    >
                      {isComplete
                        ? 'Tamamlandi'
                        : team.scoredCriteria > 0
                          ? 'Davam edir'
                          : 'Baslanmayib'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scoring interface */}
      <Card className={selectedTeam ? '' : 'opacity-60'}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {selectedTeam ? (
              <Star className="size-4 text-amber-500" />
            ) : (
              <Lock className="size-4 text-muted-foreground" />
            )}
            <CardTitle>
              {selectedTeam
                ? `${selectedTeam.name} - Qiymetlendirme`
                : 'Qiymetlendirme interfeysi'}
            </CardTitle>
          </div>
          <CardDescription>
            {selectedTeam
              ? `${selectedTeam.track} track`
              : 'Yuxaridaki siyahidan komanda secin'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2 text-base">
                    <Star className="size-4 text-amber-500" />
                    {criterion.name}
                  </Label>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {criterion.description}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  / {criterion.maxScore}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={0}
                  max={criterion.maxScore}
                  placeholder="0"
                  disabled={!selectedTeam}
                  value={scores[criterion.id] ?? ''}
                  onChange={(e) =>
                    handleScoreChange(
                      criterion.id,
                      parseInt(e.target.value) || 0,
                      criterion.maxScore
                    )
                  }
                  className="w-24"
                />
                <div className="h-2 flex-1 rounded-full bg-muted">
                  {selectedTeam && (
                    <div
                      className="h-2 rounded-full bg-[#0D47A1] transition-all"
                      style={{
                        width: `${((scores[criterion.id] ?? 0) / criterion.maxScore) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
              {criterion.id !== criteria[criteria.length - 1]?.id && <Separator />}
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">Umumi bal</p>
            <p className="text-2xl font-bold text-[#0D47A1]">
              {totalScore} / {maxTotalScore}
            </p>
          </div>

          {saveMessage && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                saveMessage.includes('ugurla')
                  ? 'border border-green-300 bg-green-50 text-green-800'
                  : 'border border-amber-300 bg-amber-50 text-amber-800'
              }`}
            >
              {saveMessage.includes('ugurla') ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <AlertTriangle className="size-4 shrink-0" />
              )}
              <span>{saveMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={!selectedTeam || saving}
              onClick={handleSaveScores}
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Qaralama saxla
            </Button>
            <Button
              disabled={!selectedTeam || submitting}
              className="bg-[#0D47A1] text-white"
              onClick={handleSubmitScores}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Qiymetlendirmeni gonder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
