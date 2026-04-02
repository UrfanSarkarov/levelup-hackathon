import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Presentation, FileText, ExternalLink } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';

type SubmissionStatus = 'draft' | 'submitted';

interface SubmissionRow {
  id: string;
  teamName: string;
  teamId: string;
  track: string;
  projectTitle: string;
  status: SubmissionStatus;
  submittedAt: string;
  demoUrl: string | null;
  repoUrl: string | null;
  files: { name: string; url: string }[];
}

function statusVariant(status: SubmissionStatus) {
  return status === 'submitted' ? ('default' as const) : ('secondary' as const);
}

function statusLabel(status: SubmissionStatus): string {
  return status === 'submitted' ? 'Gonderildi' : 'Qaralama';
}

export default async function TeqdimatlarPage() {
  let submissions: SubmissionRow[] = [];

  try {
    const supabase = createServiceClient();

    const { data: hackathon, error: hErr } = await supabase
      .from('hackathons')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (hErr || !hackathon) throw new Error('no hackathon');

    const { data: dbSubs, error: sErr } = await supabase
      .from('submissions')
      .select('id, title, is_draft, submitted_at, created_at, demo_url, repo_url, team_id, teams(name, track)')
      .eq('hackathon_id', hackathon.id)
      .order('created_at', { ascending: false });

    if (sErr || !dbSubs || dbSubs.length === 0) throw new Error('no submissions');

    // Get files for each team from storage
    const teamIds = [...new Set(dbSubs.map(s => s.team_id))];
    const filesMap = new Map<string, { name: string; url: string }[]>();

    for (const tid of teamIds) {
      try {
        const { data: files } = await supabase.storage
          .from('submissions')
          .list(tid, { limit: 20 });

        if (files && files.length > 0) {
          const signedFiles: { name: string; url: string }[] = [];
          for (const f of files.filter(fl => fl.name && !fl.name.startsWith('.'))) {
            const { data: signedData } = await supabase.storage
              .from('submissions')
              .createSignedUrl(`${tid}/${f.name}`, 3600);
            signedFiles.push({ name: f.name, url: signedData?.signedUrl ?? '' });
          }
          filesMap.set(tid, signedFiles);
        }
      } catch {
        // storage might not have this folder
      }
    }

    submissions = dbSubs.map((s: { id: string; title: string; is_draft: boolean; submitted_at: string | null; created_at: string; demo_url: string | null; repo_url: string | null; team_id: string; teams: { name: string; track: string | null }[] | { name: string; track: string | null } | null }) => {
      const teamObj = Array.isArray(s.teams) ? s.teams[0] : s.teams;
      return {
        id: s.id,
        teamName: teamObj?.name ?? '-',
        teamId: s.team_id,
        track: teamObj?.track ?? '-',
        projectTitle: s.title,
        status: (s.is_draft ? 'draft' : 'submitted') as SubmissionStatus,
        submittedAt: s.submitted_at ?? s.created_at,
        demoUrl: s.demo_url,
        repoUrl: s.repo_url,
        files: filesMap.get(s.team_id) ?? [],
      };
    });
  } catch {
    // leave defaults
  }

  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const draftCount = submissions.filter(s => s.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teqdimatlar</h1>
          <p className="text-muted-foreground">
            Komanda layihe teqdimatlari ve statuslari
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#0D47A1]/10 px-3 py-2 text-sm font-medium text-[#0D47A1]">
          <Presentation className="size-4" />
          <span>{submissions.length} teqdimat</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="size-2 rounded-full bg-[#6BBF6B]" />
          Gonderildi: <span className="font-semibold">{submittedCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="size-2 rounded-full bg-amber-400" />
          Qaralama: <span className="font-semibold">{draftCount}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teqdimat siyahisi</CardTitle>
          <CardDescription>
            Butun komanda teqdimatlari
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Komanda</TableHead>
                <TableHead>Istiqamet</TableHead>
                <TableHead>Layihe adi</TableHead>
                <TableHead>Fayllar</TableHead>
                <TableHead>Linkler</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tarix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Hec bir teqdimat tapilmadi
                  </TableCell>
                </TableRow>
              ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#0D47A1]/10 text-sm font-semibold text-[#0D47A1]">
                        {submission.teamName.charAt(0)}
                      </div>
                      {submission.teamName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-[#2EC4B6]/30 text-[#2EC4B6]"
                    >
                      {submission.track}
                    </Badge>
                  </TableCell>
                  <TableCell>{submission.projectTitle}</TableCell>
                  <TableCell>
                    {submission.files.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {submission.files.map((f) => (
                          <a
                            key={f.name}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-[#0D47A1] hover:underline"
                          >
                            <FileText className="size-3 shrink-0" />
                            {f.name}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Fayl yoxdur</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {submission.demoUrl && (
                        <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#0D47A1] hover:underline">
                          <ExternalLink className="size-3" /> Demo
                        </a>
                      )}
                      {submission.repoUrl && (
                        <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#0D47A1] hover:underline">
                          <ExternalLink className="size-3" /> Repo
                        </a>
                      )}
                      {!submission.demoUrl && !submission.repoUrl && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(submission.status)}>
                      {statusLabel(submission.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(submission.submittedAt).toLocaleDateString(
                      'az-AZ',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
