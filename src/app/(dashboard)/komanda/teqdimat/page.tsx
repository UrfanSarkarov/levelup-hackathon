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
  Tag,
  Globe,
  GitBranch,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Presentation,
  Video,
} from 'lucide-react';

export default function TeqdimatPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [hackathonId, setHackathonId] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problem: '',
    solution: '',
    techStack: [] as string[],
    demoUrl: '',
    repoUrl: '',
    videoUrl: '',
    presentationUrl: '',
  });

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/submission');
      const data = await res.json();

      if (data.error) return;

      setHackathonId(data.hackathonId);
      setTeamId(data.teamId);

      const phase = data.currentPhase;
      const status = data.teamStatus ?? 'pending';
      const unlocked = ['sprint', 'judging', 'completed'].includes(phase) && status === 'accepted';
      setIsLocked(!unlocked);

      if (data.submission) {
        setSubmissionId(data.submission.id);
        setIsSubmitted(!data.submission.is_draft && !!data.submission.submitted_at);
        setFormData({
          title: data.submission.title ?? '',
          description: data.submission.description ?? '',
          problem: data.submission.problem ?? '',
          solution: data.submission.solution ?? '',
          techStack: data.submission.tech_stack ?? [],
          demoUrl: data.submission.demo_url ?? '',
          repoUrl: data.submission.repo_url ?? '',
          videoUrl: data.submission.video_url ?? '',
          presentationUrl: data.submission.presentation_url ?? '',
        });
      }
    } catch {
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

    setErrorMsg(null);
    if (isDraft) setSaving(true);
    else setSubmitting(true);

    try {
      const res = await fetch('/api/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId,
          teamId,
          submissionId,
          isDraft,
          ...formData,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setErrorMsg(data.error);
      } else {
        if (data.submissionId) setSubmissionId(data.submissionId);
        if (!isDraft) setIsSubmitted(true);
      }
    } catch {
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const formDisabled = isLocked || isSubmitted;

  return (
    <div className="space-y-6">
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

      {isSubmitted ? (
        <Card className="border-[#6BBF6B]/50 bg-[#6BBF6B]/5">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-[#6BBF6B]/20 p-3">
              <CheckCircle2 className="size-6 text-[#6BBF6B]" />
            </div>
            <div>
              <p className="font-semibold text-[#2d7a2d]">Teqdimat ugurla gonderildi</p>
              <p className="mt-1 text-sm text-[#2d7a2d]/80">Layiheniz qiymetlendirme ucun gonderildi</p>
            </div>
            <Badge variant="outline" className="ml-auto border-[#6BBF6B] text-[#6BBF6B]">
              <CheckCircle2 className="mr-1 size-3" /> Gonderildi
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
              <p className="font-semibold text-amber-800">Bu bolme yalniz Sprint fazasinda aktivdir</p>
              <p className="mt-1 text-sm text-amber-700">Teqdimat formu Sprint merehesi baslayanda acilacaq</p>
            </div>
            <Badge variant="outline" className="ml-auto border-amber-400 text-amber-700">
              <AlertTriangle className="mr-1 size-3" /> Gozleyir
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      {errorMsg && (
        <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          Xəta: {errorMsg}
        </div>
      )}

      {!isLocked && !isSubmitted && <Separator />}

      {loading ? (
        <div className="flex items-center justify-center py-12" role="status" aria-label="Yüklənir">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Yüklənir...</span>
        </div>
      ) : (
        <>
          {isLocked && <Separator />}

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
              <div className="space-y-2">
                <Label htmlFor="title">Layihe adi</Label>
                <Input id="title" name="title" placeholder="Layihenizin adi"
                  value={formData.title} onChange={handleChange} disabled={formDisabled} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tesvir</Label>
                <Textarea id="description" name="description" placeholder="Layiheniz haqqinda qisa melumat"
                  rows={3} value={formData.description} onChange={handleChange} disabled={formDisabled} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">Problem</Label>
                <Textarea id="problem" name="problem" placeholder="Hell etdiyiniz problemi tesvir edin"
                  rows={3} value={formData.problem} onChange={handleChange} disabled={formDisabled} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Hell</Label>
                <Textarea id="solution" name="solution" placeholder="Hellnizi tesvir edin"
                  rows={3} value={formData.solution} onChange={handleChange} disabled={formDisabled} />
              </div>

              <div className="space-y-2">
                <Label><Tag className="mr-1 inline size-3.5" /> Tech stack</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tag) => (
                    <Badge key={tag} variant="secondary"
                      className={formDisabled ? 'opacity-50' : 'cursor-pointer'}
                      onClick={() => !formDisabled && removeTechTag(tag)}>
                      {tag}{!formDisabled && ' x'}
                    </Badge>
                  ))}
                </div>
                {!formDisabled && (
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Texnologiya elave edin" value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechTag(); } }} />
                    <Button type="button" variant="outline" onClick={addTechTag}>Elave et</Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentationUrl">
                  <Presentation className="mr-1 inline size-3.5" /> Teqdimat linki
                </Label>
                <Input id="presentationUrl" name="presentationUrl"
                  placeholder="Google Slides, Canva, PDF linki ve s."
                  value={formData.presentationUrl} onChange={handleChange} disabled={formDisabled} />
                <p className="text-xs text-muted-foreground">Teqdimatinizin linkini daxil edin (Google Slides, Canva, Figma ve s.)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoUrl"><Globe className="mr-1 inline size-3.5" /> Demo URL</Label>
                <Input id="demoUrl" name="demoUrl" placeholder="https://demo.example.com"
                  value={formData.demoUrl} onChange={handleChange} disabled={formDisabled} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repoUrl"><GitBranch className="mr-1 inline size-3.5" /> Repository URL</Label>
                <Input id="repoUrl" name="repoUrl" placeholder="https://github.com/user/repo"
                  value={formData.repoUrl} onChange={handleChange} disabled={formDisabled} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl"><Video className="mr-1 inline size-3.5" /> Video URL</Label>
                <Input id="videoUrl" name="videoUrl" placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl} onChange={handleChange} disabled={formDisabled} />
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" disabled={formDisabled || saving} onClick={() => saveSubmission(true)}>
                  {saving ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : null}
                  Qaralama olaraq saxla
                </Button>
                <Button disabled={formDisabled || submitting} className="bg-[#0D47A1] text-white"
                  onClick={() => saveSubmission(false)}>
                  {submitting ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : <Send className="mr-2 size-4" aria-hidden="true" />}
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
