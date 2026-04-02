'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Trash2,
  FileText,
  Upload,
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
}

export default function TeqdimatPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [hackathonId, setHackathonId] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch('/api/submission');
      const data = await res.json();

      if (data.error) return;

      setHackathonId(data.hackathonId);
      setTeamId(data.teamId);

      const phase = data.currentPhase;
      const unlocked = ['sprint', 'judging', 'completed'].includes(phase);
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
        });
      }

      if (data.files) {
        setUploadedFiles(data.files.map((f: { name: string; size: number }) => ({
          name: f.name,
          size: f.size,
        })));
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

  const handleFileUpload = async (file: File) => {
    if (!teamId) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('Fayl olcusu 10MB-dan boyuk ola bilmez');
      return;
    }

    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
    ];
    if (!allowed.includes(file.type)) {
      setUploadError('Yalniz PDF, PPTX ve ZIP faylları yuklenə biler');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('teamId', teamId);

      const res = await fetch('/api/submission/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (data.error) {
        setUploadError(data.error);
      } else {
        setUploadedFiles((prev) => {
          const filtered = prev.filter((f) => f.name !== data.fileName);
          return [...filtered, { name: data.fileName, size: data.fileSize }];
        });
      }
    } catch {
      setUploadError('Yuklemede xeta bas verdi');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!teamId) return;
    try {
      const res = await fetch('/api/submission', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, fileName }),
      });
      const data = await res.json();
      if (!data.error) {
        setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
      }
    } catch {}
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const saveSubmission = async (isDraft: boolean) => {
    if (!teamId || !hackathonId) return;

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
        alert('Xeta: ' + data.error);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
                <Input
                  id="title"
                  name="title"
                  placeholder="Layihenizin adi"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={formDisabled}
                />
              </div>

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
                    : null}
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

              {/* File upload */}
              <div className="space-y-2">
                <Label>
                  <FileUp className="mr-1 inline size-3.5" />
                  Teqdimat fayli (maks. 10MB)
                </Label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.pptx,.zip"
                  className="hidden"
                  onChange={onFileSelect}
                  disabled={formDisabled}
                />

                {/* Drop zone */}
                {!formDisabled && (
                  <div
                    className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
                      dragOver
                        ? 'border-[#0D47A1] bg-[#0D47A1]/5'
                        : 'border-muted-foreground/30 bg-muted/30 hover:border-[#0D47A1]/50 hover:bg-muted/50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                  >
                    <div className="flex flex-col items-center text-center text-muted-foreground">
                      {uploading ? (
                        <Loader2 className="mb-2 size-8 animate-spin" />
                      ) : (
                        <Upload className="mb-2 size-8" />
                      )}
                      <p className="text-sm font-medium">
                        {uploading ? 'Yuklenilir...' : 'Fayli bura surukleyin ve ya klikleyin'}
                      </p>
                      <p className="mt-1 text-xs">PDF, PPTX, ZIP (maks. 10MB)</p>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}

                {/* Uploaded files list */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between rounded-lg border px-4 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-[#0D47A1]" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        {!formDisabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.name)}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

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
