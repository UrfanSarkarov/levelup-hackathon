'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Lock,
  FileUp,
  Tag,
  Globe,
  GitBranch,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Page ────────────────────────────────────────────────── */
export default function TeqdimatPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('registration_open');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [hackathonId, setHackathonId] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problem: '',
    solution: '',
    techStack: [] as string[],
    demoUrl: '',
    repoUrl: '',
    videoUrl: '',
  });

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get hackathon phase
      const { data: hackathon } = await supabase
        .from('hackathons')
        .select('id, current_phase')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (hackathon) {
        setHackathonId(hackathon.id);
        setCurrentPhase(hackathon.current_phase);
        const unlocked = ['sprint', 'judging', 'completed'].includes(
          hackathon.current_phase
        );
        setIsLocked(!unlocked);
      }

      // Find the user's team
      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) return;
      setTeamId(membership.team_id);

      // Load existing submission
      const { data: submission } = await supabase
        .from('submissions')
        .select('id, title, description, problem, solution, tech_stack, demo_url, repo_url, video_url, is_draft, submitted_at')
        .eq('team_id', membership.team_id)
        .limit(1)
        .single();

      if (submission) {
        setSubmissionId(submission.id);
        setIsSubmitted(!submission.is_draft && !!submission.submitted_at);
        setFormData({
          title: submission.title ?? '',
          description: submission.description ?? '',
          problem: submission.problem ?? '',
          solution: submission.solution ?? '',
          techStack: submission.tech_stack ?? [],
          demoUrl: submission.demo_url ?? '',
          repoUrl: submission.repo_url ?? '',
          videoUrl: submission.video_url ?? '',
        });
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTechTag = () => {
    const tag = techInput.trim();
    if (tag && !formData.techStack.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, tag],
      }));
      setTechInput('');
    }
  };

  const removeTechTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tag),
    }));
  };

  const saveSubmission = async (isDraft: boolean) => {
    if (!teamId || !hackathonId) return;

    if (isDraft) {
      setSaving(true);
    } else {
      setSubmitting(true);
    }

    try {
      const supabase = createClient();

      const payload = {
        hackathon_id: hackathonId,
        team_id: teamId,
        title: formData.title,
        description: formData.description || null,
        problem: formData.problem || null,
        solution: formData.solution || null,
        tech_stack: formData.techStack,
        demo_url: formData.demoUrl || null,
        repo_url: formData.repoUrl || null,
        video_url: formData.videoUrl || null,
        is_draft: isDraft,
        submitted_at: isDraft ? null : new Date().toISOString(),
      };

      if (submissionId) {
        await supabase
          .from('submissions')
          .update(payload)
          .eq('id', submissionId);
      } else {
        const { data } = await supabase
          .from('submissions')
          .insert(payload)
          .select('id')
          .single();

        if (data) {
          setSubmissionId(data.id);
        }
      }

      if (!isDraft) {
        setIsSubmitted(true);
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const formDisabled = isLocked || isSubmitted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#6BBF6B]/10 p-2">
          <Send className="size-5 text-[#6BBF6B]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Layihe Teqdimati
          </h1>
          <p className="text-muted-foreground">
            Layihenizi teqdim edin ve qiymetlendirmeye gonderin
          </p>
        </div>
      </div>

      {/* Phase gate lock / submitted banner */}
      {isSubmitted ? (
        <Card className="border-[#6BBF6B]/50 bg-[#6BBF6B]/5">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-[#6BBF6B]/20 p-3">
              <CheckCircle2 className="size-6 text-[#6BBF6B]" />
            </div>
            <div>
              <p className="font-semibold text-[#2d7a2d]">
                Teqdimat ugurla gonderildi
              </p>
              <p className="mt-1 text-sm text-[#2d7a2d]/80">
                Layiheniz qiymetlendirme ucun gonderildi
              </p>
            </div>
            <Badge variant="outline" className="ml-auto border-[#6BBF6B] text-[#6BBF6B]">
              <CheckCircle2 className="mr-1 size-3" />
              Gonderildi
            </Badge>
          </CardContent>
        </Card>
      ) : isLocked ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-amber-100 p-3">
              <Lock className="size-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                Bu bolme yalniz Sprint fazasinda aktivdir
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Teqdimat formu Sprint merehesi baslayanda acilacaq
              </p>
            </div>
            <Badge variant="outline" className="ml-auto border-amber-400 text-amber-700">
              <AlertTriangle className="mr-1 size-3" />
              Gozleyir
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      {!isLocked && !isSubmitted && <Separator />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {isLocked && <Separator />}

          {/* Form */}
          <Card className={formDisabled ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle>Teqdimat Formu</CardTitle>
              <CardDescription>
                {formDisabled
                  ? 'Asagidaki melumatlar Sprint fazasinda doldurulacaq'
                  : 'Layiheniz haqqinda melumat daxil edin'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project name */}
              <div className="space-y-2">
                <Label htmlFor="title">Layihe adi</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Layihenizin adi"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={formDisabled}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Tesvir</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Layiheniz haqqinda qisa melumat"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={formDisabled}
                />
              </div>

              {/* Problem */}
              <div className="space-y-2">
                <Label htmlFor="problem">Problem</Label>
                <Textarea
                  id="problem"
                  name="problem"
                  placeholder="Hell etdiyiniz problemi tesvir edin"
                  rows={3}
                  value={formData.problem}
                  onChange={handleChange}
                  disabled={formDisabled}
                />
              </div>

              {/* Solution */}
              <div className="space-y-2">
                <Label htmlFor="solution">Hell</Label>
                <Textarea
                  id="solution"
                  name="solution"
                  placeholder="Hellnizi tesvir edin"
                  rows={3}
                  value={formData.solution}
                  onChange={handleChange}
                  disabled={formDisabled}
                />
              </div>

              {/* Tech stack tags */}
              <div className="space-y-2">
                <Label>
                  <Tag className="mr-1 inline size-3.5" />
                  Tech stack
                </Label>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.length > 0
                    ? formData.techStack.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={formDisabled ? 'opacity-50' : 'cursor-pointer'}
                          onClick={() => !formDisabled && removeTechTag(tag)}
                        >
                          {tag}
                          {!formDisabled && ' x'}
                        </Badge>
                      ))
                    : ['React', 'Node.js', 'PostgreSQL', 'Tailwind'].map((tag) => (
                        <Badge key={tag} variant="secondary" className="opacity-50">
                          {tag}
                        </Badge>
                      ))}
                </div>
                {!formDisabled && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Texnologiya elave edin"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTechTag}>
                      Elave et
                    </Button>
                  </div>
                )}
              </div>

              {/* Demo URL */}
              <div className="space-y-2">
                <Label htmlFor="demoUrl">
                  <Globe className="mr-1 inline size-3.5" />
                  Demo URL
                </Label>
                <Input
                  id="demoUrl"
                  name="demoUrl"
                  placeholder="https://demo.example.com"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  disabled={formDisabled}
                />
              </div>

              {/* Repository URL */}
              <div className="space-y-2">
                <Label htmlFor="repoUrl">
                  <GitBranch className="mr-1 inline size-3.5" />
                  Repository URL
                </Label>
                <Input
                  id="repoUrl"
                  name="repoUrl"
                  placeholder="https://github.com/user/repo"
                  value={formData.repoUrl}
                  onChange={handleChange}
                  disabled={formDisabled}
                />
              </div>

              {/* File upload area */}
              <div className="space-y-2">
                <Label>Teqdimat fayli yukleme sahesi</Label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-10">
                  <div className="flex flex-col items-center text-center text-muted-foreground">
                    <FileUp className="mb-2 size-8" />
                    <p className="text-sm font-medium">
                      Fayli bura surukleyin ve ya klikleyin
                    </p>
                    <p className="mt-1 text-xs">PDF, PPTX, ZIP (maks. 50MB)</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  disabled={formDisabled || saving}
                  onClick={() => saveSubmission(true)}
                >
                  {saving ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  Qaralama olaraq saxla
                </Button>
                <Button
                  disabled={formDisabled || submitting}
                  className="bg-[#0D47A1] text-white"
                  onClick={() => saveSubmission(false)}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  Son teqdimati gonder
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
