import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/team-submission?teamId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'teamId lazimdir' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Get submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('id, title, description, problem, solution, tech_stack, demo_url, repo_url, video_url, is_draft, submitted_at')
    .eq('team_id', teamId)
    .limit(1)
    .single();

  // Get files from storage
  let files: { name: string; url: string }[] = [];
  try {
    const { data: storageFiles } = await supabase.storage
      .from('submissions')
      .list(teamId, { limit: 20 });

    if (storageFiles && storageFiles.length > 0) {
      for (const f of storageFiles.filter(fl => fl.name && !fl.name.startsWith('.'))) {
        const { data: signedData } = await supabase.storage
          .from('submissions')
          .createSignedUrl(`${teamId}/${f.name}`, 3600);
        files.push({ name: f.name, url: signedData?.signedUrl ?? '' });
      }
    }
  } catch {
    // bucket may not exist
  }

  return NextResponse.json({
    submission: submission ?? null,
    files,
  });
}
