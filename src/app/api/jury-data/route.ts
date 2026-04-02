import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/jury-data - load jury assignments, scores, criteria
export async function GET() {
  try {
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Giris edin' }, { status: 401 });

    const supabase = getServiceSupabase();

    // Get active judging round
    const { data: activeRound } = await supabase
      .from('judging_rounds')
      .select('id, name')
      .eq('is_active', true)
      .order('round_number', { ascending: true })
      .limit(1)
      .single();

    if (!activeRound) {
      return NextResponse.json({ error: 'no_round', teams: [], criteria: [] });
    }

    // Get judge assignments (status column, NOT is_completed)
    const { data: assignments } = await supabase
      .from('judge_assignments')
      .select('id, team_id, status')
      .eq('round_id', activeRound.id)
      .eq('judge_id', user.id);

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ error: 'no_assignments', teams: [], criteria: [] });
    }

    // Get team info
    const teamIds = assignments.map(a => a.team_id);
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, track')
      .in('id', teamIds);

    const teamMap = new Map((teams ?? []).map(t => [t.id, t]));

    // Get judging criteria for this round
    let criteria: { id: string; name: string; maxScore: number; description: string }[] = [];
    const { data: dbCriteria } = await supabase
      .from('judging_criteria')
      .select('id, name, max_score, description')
      .eq('round_id', activeRound.id)
      .order('name');

    if (dbCriteria && dbCriteria.length > 0) {
      criteria = dbCriteria.map(c => ({
        id: c.id, name: c.name, maxScore: c.max_score, description: c.description || '',
      }));
    }

    // Fallback if no criteria in DB
    if (criteria.length === 0) {
      criteria = [
        { id: 'c1', name: 'Problemin aydinliqi', maxScore: 10, description: 'Komanda heqiqi bir problemi duzgun identifikasiya edibmi?' },
        { id: 'c2', name: 'Hellin innovativliyi', maxScore: 10, description: 'Teklif olunan hell movcud hellerden ne ile ferqlenir?' },
        { id: 'c3', name: 'Texniki icra imkani', maxScore: 10, description: 'Hellin texniki olaraq heyata kecirilmesi mumkundurmu?' },
        { id: 'c4', name: 'Potensial tesir', maxScore: 10, description: 'Layihenin potensial tesiri ne qeder boyukdur?' },
        { id: 'c5', name: 'Hedef auditoriya', maxScore: 10, description: 'Hedef auditoriya duzgun mueyyen olunubmu?' },
        { id: 'c6', name: 'Biznes modeli', maxScore: 10, description: 'Biznes modeli ve ya davamlilig plani varmi?' },
        { id: 'c7', name: 'Teqdimat keyfiyyeti', maxScore: 10, description: 'Komandanin teqdimati ne qeder aydin ve inandiricidur?' },
        { id: 'c8', name: 'Prototip ve demo', maxScore: 10, description: 'Prototip ve ya demo ne qeder funksionaldir?' },
        { id: 'c9', name: 'Inkisaf potensiali', maxScore: 10, description: 'Layihenin inkisaf potensiali (scalability) necedir?' },
      ];
    }

    // Get existing scores via assignment_id (correct schema)
    const assignmentIds = assignments.map(a => a.id);
    const { data: existingScores } = await supabase
      .from('scores')
      .select('assignment_id, criterion_id, score')
      .in('assignment_id', assignmentIds);

    // Build assignment -> team mapping
    const assignmentTeamMap = new Map(assignments.map(a => [a.id, a.team_id]));

    // Build score map: team_id -> criterion_id -> score
    const scoreMap: Record<string, Record<string, number>> = {};
    (existingScores ?? []).forEach(s => {
      const teamId = assignmentTeamMap.get(s.assignment_id);
      if (!teamId) return;
      if (!scoreMap[teamId]) scoreMap[teamId] = {};
      scoreMap[teamId][s.criterion_id] = Number(s.score);
    });

    // Build teams response
    const teamsResult = assignments.map(a => {
      const team = teamMap.get(a.team_id);
      const teamScores = scoreMap[a.team_id] ?? {};
      const scoredCount = Object.values(teamScores).filter(v => v > 0).length;
      const isCompleted = a.status === 'completed';
      return {
        id: a.team_id,
        assignmentId: a.id,
        name: team?.name ?? 'Namelum',
        track: team?.track ?? '',
        isCompleted,
        scoredCriteria: isCompleted ? criteria.length : scoredCount,
        scores: teamScores,
      };
    });

    return NextResponse.json({
      roundId: activeRound.id,
      userId: user.id,
      teams: teamsResult,
      criteria,
    });
  } catch (err) {
    console.error('Jury data error:', err);
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}

// POST /api/jury-data - save scores
export async function POST(request: NextRequest) {
  try {
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Giris edin' }, { status: 401 });

    const { roundId, teamId, scores, submit } = await request.json();

    const supabase = getServiceSupabase();

    // Find the assignment for this judge + team + round
    const { data: assignment } = await supabase
      .from('judge_assignments')
      .select('id')
      .eq('round_id', roundId)
      .eq('judge_id', user.id)
      .eq('team_id', teamId)
      .single();

    if (!assignment) {
      return NextResponse.json({ error: 'Teyin tapilmadi' }, { status: 404 });
    }

    // Upsert scores using (assignment_id, criterion_id) unique constraint
    for (const [criterionId, score] of Object.entries(scores)) {
      await supabase.from('scores').upsert(
        {
          assignment_id: assignment.id,
          criterion_id: criterionId,
          judge_id: user.id,
          score: score as number,
        },
        { onConflict: 'assignment_id,criterion_id' }
      );
    }

    // Update assignment status
    if (submit) {
      await supabase
        .from('judge_assignments')
        .update({ status: 'completed' })
        .eq('id', assignment.id);
    } else {
      // Mark as in_progress if not already completed
      await supabase
        .from('judge_assignments')
        .update({ status: 'in_progress' })
        .eq('id', assignment.id)
        .eq('status', 'pending');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Jury save error:', err);
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}
