import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET - load submission + uploaded files
export async function GET() {
  try {
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Giris edin' }, { status: 401 });

    const supabase = getServiceSupabase();

    // Get hackathon
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('id, current_phase')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get team
    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!membership) return NextResponse.json({ error: 'Komanda tapilmadi' }, { status: 404 });

    // Get submission
    const { data: submission } = await supabase
      .from('submissions')
      .select('id, title, description, problem, solution, tech_stack, demo_url, repo_url, video_url, is_draft, submitted_at')
      .eq('team_id', membership.team_id)
      .limit(1)
      .single();

    // List uploaded files from storage
    const { data: files } = await supabase.storage
      .from('submissions')
      .list(membership.team_id, { limit: 20 });

    const uploadedFiles = (files ?? []).map(f => ({
      name: f.name,
      size: f.metadata?.size ?? 0,
      url: supabase.storage.from('submissions').getPublicUrl(`${membership.team_id}/${f.name}`).data.publicUrl,
    }));

    return NextResponse.json({
      hackathonId: hackathon?.id ?? null,
      currentPhase: hackathon?.current_phase ?? 'registration_open',
      teamId: membership.team_id,
      submission: submission ?? null,
      files: uploadedFiles,
    });
  } catch {
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}

// POST - save submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hackathonId, teamId, submissionId, isDraft, ...formData } = body;

    if (!hackathonId || !teamId) {
      return NextResponse.json({ error: 'hackathonId ve teamId lazimdir' }, { status: 400 });
    }

    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Giris edin' }, { status: 401 });

    const supabase = getServiceSupabase();

    const payload = {
      hackathon_id: hackathonId,
      team_id: teamId,
      title: formData.title || '',
      description: formData.description || null,
      problem: formData.problem || null,
      solution: formData.solution || null,
      tech_stack: formData.techStack || [],
      demo_url: formData.demoUrl || null,
      repo_url: formData.repoUrl || null,
      video_url: formData.videoUrl || null,
      is_draft: isDraft,
      submitted_at: isDraft ? null : new Date().toISOString(),
    };

    let resultId = submissionId;

    if (submissionId) {
      const { error } = await supabase
        .from('submissions')
        .update(payload)
        .eq('id', submissionId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { data, error } = await supabase
        .from('submissions')
        .insert(payload)
        .select('id')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      resultId = data?.id;
    }

    return NextResponse.json({ success: true, submissionId: resultId });
  } catch {
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}

// DELETE - delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const { teamId, fileName } = await request.json();
    if (!teamId || !fileName) {
      return NextResponse.json({ error: 'teamId ve fileName lazimdir' }, { status: 400 });
    }

    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Giris edin' }, { status: 401 });

    const supabase = getServiceSupabase();

    const { error } = await supabase.storage
      .from('submissions')
      .remove([`${teamId}/${fileName}`]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server xetasi' }, { status: 500 });
  }
}
