'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

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
  roundId: string;
  roundName: string;
  isPublished: boolean;
  judges: JudgeInfo[];
  teams: TeamScore[];
  criteria: { id: string; name: string; maxScore: number }[];
}

export async function getScoringResults(): Promise<ScoringData | null> {
  const supabase = getSupabase();

  // Get active or latest judging round
  const { data: round } = await supabase
    .from('judging_rounds')
    .select('id, name, is_active')
    .order('is_active', { ascending: false })
    .order('round_number', { ascending: false })
    .limit(1)
    .single();

  if (!round) return null;

  // Get all judge assignments for this round (using status, not is_completed)
  const { data: assignments } = await supabase
    .from('judge_assignments')
    .select('id, judge_id, team_id, status')
    .eq('round_id', round.id);

  if (!assignments || assignments.length === 0) return null;

  // Get judge profiles
  const judgeIds = [...new Set(assignments.map(a => a.judge_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', judgeIds);
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p.full_name ?? 'Namelum']));

  // Get team info
  const teamIds = [...new Set(assignments.map(a => a.team_id))];
  const { data: teamsData } = await supabase
    .from('teams')
    .select('id, name, track')
    .in('id', teamIds);
  const teamInfoMap = new Map((teamsData ?? []).map(t => [t.id, { name: t.name, track: t.track ?? '' }]));

  // Get judging criteria for this round
  let criteria: { id: string; name: string; maxScore: number }[] = [];
  const { data: dbCriteria } = await supabase
    .from('judging_criteria')
    .select('id, name, max_score')
    .eq('round_id', round.id)
    .order('name');

  if (dbCriteria && dbCriteria.length > 0) {
    criteria = dbCriteria.map(c => ({ id: c.id, name: c.name, maxScore: c.max_score }));
  }

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

  // Get all scores via assignment_id (correct schema)
  const assignmentIds = assignments.map(a => a.id);
  const { data: scores } = await supabase
    .from('scores')
    .select('assignment_id, criterion_id, score')
    .in('assignment_id', assignmentIds);

  // Map assignment_id -> { judge_id, team_id }
  const assignmentMap = new Map(assignments.map(a => [a.id, { judgeId: a.judge_id, teamId: a.team_id }]));

  // Build score map: judge_id -> team_id -> criterion_id -> score
  const scoreMap = new Map<string, Map<string, Map<string, number>>>();
  (scores ?? []).forEach(s => {
    const info = assignmentMap.get(s.assignment_id);
    if (!info) return;
    if (!scoreMap.has(info.judgeId)) scoreMap.set(info.judgeId, new Map());
    const judgeMap = scoreMap.get(info.judgeId)!;
    if (!judgeMap.has(info.teamId)) judgeMap.set(info.teamId, new Map());
    judgeMap.get(info.teamId)!.set(s.criterion_id, Number(s.score));
  });

  // Build judges info & team data
  const judgeAggMap = new Map<string, { name: string; completed: number; total: number }>();
  const teamMap = new Map<string, { name: string; track: string; judges: TeamScore['judges'] }>();

  for (const a of assignments) {
    const judgeName = profileMap.get(a.judge_id) ?? 'Namelum';
    const isCompleted = a.status === 'completed';

    // Track judges
    if (!judgeAggMap.has(a.judge_id)) {
      judgeAggMap.set(a.judge_id, { name: judgeName, completed: 0, total: 0 });
    }
    const j = judgeAggMap.get(a.judge_id)!;
    j.total++;
    if (isCompleted) j.completed++;

    // Track teams
    const teamInfo = teamInfoMap.get(a.team_id);
    const teamName = teamInfo?.name ?? 'Namelum';
    const track = teamInfo?.track ?? '';

    if (!teamMap.has(a.team_id)) {
      teamMap.set(a.team_id, { name: teamName, track, judges: [] });
    }

    // Get this judge's scores for this team
    const criteriaScores: Record<string, number> = {};
    let total = 0;
    const judgeScores = scoreMap.get(a.judge_id)?.get(a.team_id);
    if (judgeScores) {
      for (const c of criteria) {
        const score = judgeScores.get(c.id) ?? 0;
        criteriaScores[c.id] = score;
        total += score;
      }
    }

    teamMap.get(a.team_id)!.judges.push({
      judgeId: a.judge_id,
      judgeName,
      criteriaScores,
      total,
      isCompleted,
    });
  }

  // Build final teams list with rankings
  const teams: TeamScore[] = [];
  for (const [teamId, data] of teamMap) {
    const completedJudges = data.judges.filter(j => j.isCompleted);
    const grandTotal = data.judges.reduce((sum, j) => sum + j.total, 0);
    const avgTotal = data.judges.length > 0
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

  const judges: JudgeInfo[] = Array.from(judgeAggMap.entries()).map(([id, info]) => ({
    id,
    name: info.name,
    completedCount: info.completed,
    totalCount: info.total,
  }));

  // Round is published if it was deactivated (is_active = false means results were sent)
  const isPublished = !round.is_active;

  return {
    roundId: round.id,
    roundName: round.name,
    isPublished,
    judges,
    teams,
    criteria,
  };
}

// Publish final results - send notifications to teams with their placement
export async function publishResults(roundId: string) {
  try {
    const supabase = getSupabase();

    // Get scoring data
    const data = await getScoringResults();
    if (!data || data.teams.length === 0) {
      return { error: 'Qiymetlendirme neticeleri tapilmadi' };
    }

    // Get hackathon ID
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!hackathon) return { error: 'Hackathon tapilmadi' };

    // Send notification to each team with their placement
    const notifications: {
      hackathon_id: string;
      user_id: string;
      type: string;
      title: string;
      body: string;
      is_read: boolean;
    }[] = [];

    for (let i = 0; i < data.teams.length; i++) {
      const team = data.teams[i];
      const rank = i + 1;

      let title: string;
      let body: string;

      if (rank === 1) {
        title = '1-ci yer - Tebriklər!';
        body = `"${team.teamName}" komandasi Level UP Hackathon-da 1-ci yeri qazandi! Ortalama bal: ${team.averageTotal}. Sizi tebrik edirik!`;
      } else if (rank === 2) {
        title = '2-ci yer - Tebriklər!';
        body = `"${team.teamName}" komandasi Level UP Hackathon-da 2-ci yeri qazandi! Ortalama bal: ${team.averageTotal}. Ela netice!`;
      } else if (rank === 3) {
        title = '3-cu yer - Tebriklər!';
        body = `"${team.teamName}" komandasi Level UP Hackathon-da 3-cu yeri qazandi! Ortalama bal: ${team.averageTotal}. Gozel is!`;
      } else {
        title = `${rank}-cu yer`;
        body = `"${team.teamName}" komandasi Level UP Hackathon-da ${rank}-cu yeri tutdu. Ortalama bal: ${team.averageTotal}. Istirak etdiyiniz ucun tesekkur edirik!`;
      }

      // Get all team members
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', team.teamId)
        .not('user_id', 'is', null);

      for (const m of (members ?? [])) {
        notifications.push({
          hackathon_id: hackathon.id,
          user_id: m.user_id,
          type: rank <= 3 ? 'success' : 'info',
          title,
          body,
          is_read: false,
        });
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: nErr } = await supabase.from('notifications').insert(notifications);
      if (nErr) {
        return { error: 'Bildirisler gonderilerkən xeta: ' + nErr.message };
      }
    }

    // Deactivate round (results published)
    await supabase
      .from('judging_rounds')
      .update({ is_active: false })
      .eq('id', roundId);

    revalidatePath('/idarepanel/qiymetlendirme');
    revalidatePath('/komanda');
    revalidatePath('/komanda/bildirisler');

    return { success: true, teamCount: data.teams.length };
  } catch (err) {
    console.error('Publish results error:', err);
    return { error: 'Server xetasi: ' + (err instanceof Error ? err.message : 'Namelum xeta') };
  }
}
