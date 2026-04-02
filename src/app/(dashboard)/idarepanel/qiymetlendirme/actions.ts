'use server';

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export interface JudgeInfo {
  id: string;
  name: string;
  completedCount: number;
  totalCount: number;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  track: string;
  judges: {
    judgeId: string;
    judgeName: string;
    criteriaScores: Record<string, number>;
    total: number;
    isCompleted: boolean;
  }[];
  averageTotal: number;
  grandTotal: number;
  judgesCompleted: number;
  judgesTotal: number;
}

export interface ScoringData {
  roundName: string;
  judges: JudgeInfo[];
  teams: TeamScore[];
  criteria: { id: string; name: string; maxScore: number }[];
}

export async function getScoringResults(): Promise<ScoringData | null> {
  const supabase = getSupabase();

  // Get active or latest judging round
  const { data: round } = await supabase
    .from('judging_rounds')
    .select('id, name')
    .order('is_active', { ascending: false })
    .order('round_number', { ascending: false })
    .limit(1)
    .single();

  if (!round) return null;

  // Get all judge assignments for this round
  const { data: assignments } = await supabase
    .from('judge_assignments')
    .select('judge_id, team_id, is_completed, teams(name, track), profiles!judge_assignments_judge_id_fkey(full_name)')
    .eq('round_id', round.id);

  if (!assignments || assignments.length === 0) return null;

  // Get all scores for this round
  const { data: scores } = await supabase
    .from('scores')
    .select('judge_id, team_id, criterion_id, score')
    .eq('round_id', round.id);

  // Try to get scoring criteria from DB
  let criteria: { id: string; name: string; maxScore: number }[] = [];
  try {
    const { data: dbCriteria } = await supabase
      .from('scoring_criteria')
      .select('id, name, max_score');
    if (dbCriteria && dbCriteria.length > 0) {
      criteria = dbCriteria.map((c) => ({ id: c.id, name: c.name, maxScore: c.max_score }));
    }
  } catch {
    // table may not exist
  }

  // Fallback to hardcoded criteria
  if (criteria.length === 0) {
    criteria = [
      { id: 'c1', name: 'Problemin aydinliqi', maxScore: 10 },
      { id: 'c2', name: 'Hellin innovativliyi', maxScore: 10 },
      { id: 'c3', name: 'Texniki icra imkani', maxScore: 10 },
      { id: 'c4', name: 'Potensial tesir', maxScore: 10 },
      { id: 'c5', name: 'Hedef auditoriya', maxScore: 10 },
      { id: 'c6', name: 'Biznes modeli', maxScore: 10 },
      { id: 'c7', name: 'Teqdimat keyfiyyeti', maxScore: 10 },
      { id: 'c8', name: 'Prototip ve demo', maxScore: 10 },
      { id: 'c9', name: 'Inkisaf potensiali', maxScore: 10 },
    ];
  }

  // Build score map: judge_id -> team_id -> criterion_id -> score
  const scoreMap = new Map<string, Map<string, Map<string, number>>>();
  (scores ?? []).forEach((s) => {
    if (!scoreMap.has(s.judge_id)) scoreMap.set(s.judge_id, new Map());
    const judgeMap = scoreMap.get(s.judge_id)!;
    if (!judgeMap.has(s.team_id)) judgeMap.set(s.team_id, new Map());
    judgeMap.get(s.team_id)!.set(s.criterion_id, s.score);
  });

  // Build judges info
  const judgeMap = new Map<string, { name: string; completed: number; total: number }>();
  const teamMap = new Map<string, { name: string; track: string; judges: TeamScore['judges'] }>();

  for (const a of assignments) {
    const rawProfile = a.profiles as unknown;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
    const judgeName = (profile as { full_name: string } | null)?.full_name ?? 'Namelum';
    const judgeId = a.judge_id;

    // Track judges
    if (!judgeMap.has(judgeId)) {
      judgeMap.set(judgeId, { name: judgeName, completed: 0, total: 0 });
    }
    const j = judgeMap.get(judgeId)!;
    j.total++;
    if (a.is_completed) j.completed++;

    // Track teams
    const rawTeam = a.teams as unknown;
    const teamData = Array.isArray(rawTeam) ? rawTeam[0] : rawTeam;
    const teamName = (teamData as { name: string } | null)?.name ?? 'Namelum';
    const track = (teamData as { track: string } | null)?.track ?? '';

    if (!teamMap.has(a.team_id)) {
      teamMap.set(a.team_id, { name: teamName, track, judges: [] });
    }

    // Get this judge's scores for this team
    const criteriaScores: Record<string, number> = {};
    let total = 0;
    const judgeScores = scoreMap.get(judgeId)?.get(a.team_id);
    if (judgeScores) {
      for (const c of criteria) {
        const score = judgeScores.get(c.id) ?? 0;
        criteriaScores[c.id] = score;
        total += score;
      }
    }

    teamMap.get(a.team_id)!.judges.push({
      judgeId,
      judgeName,
      criteriaScores,
      total,
      isCompleted: a.is_completed ?? false,
    });
  }

  // Build final teams list with rankings
  const teams: TeamScore[] = [];
  for (const [teamId, data] of teamMap) {
    const completedJudges = data.judges.filter((j) => j.isCompleted);
    const grandTotal = data.judges.reduce((sum, j) => sum + j.total, 0);
    const avgTotal = completedJudges.length > 0
      ? grandTotal / data.judges.length
      : 0;

    teams.push({
      teamId,
      teamName: data.name,
      track: data.track,
      judges: data.judges,
      averageTotal: Math.round(avgTotal * 100) / 100,
      grandTotal,
      judgesCompleted: completedJudges.length,
      judgesTotal: data.judges.length,
    });
  }

  // Sort by average total descending
  teams.sort((a, b) => b.averageTotal - a.averageTotal);

  const judges: JudgeInfo[] = Array.from(judgeMap.entries()).map(([id, info]) => ({
    id,
    name: info.name,
    completedCount: info.completed,
    totalCount: info.total,
  }));

  return {
    roundName: round.name,
    judges,
    teams,
    criteria,
  };
}
