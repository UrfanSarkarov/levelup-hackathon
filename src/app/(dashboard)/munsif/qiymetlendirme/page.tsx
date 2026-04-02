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
  ChevronRight,
  Lock,
  AlertTriangle,
  Loader2,
  Check,
  FileText,
  ExternalLink,
  Globe,
  GitBranch,
  Video,
} from 'lucide-react';

interface AssignedTeam {
  id: string;
  name: string;
  track: string;
  isCompleted: boolean;
  scoredCriteria: number;
  scores: Record<string, number>;
}

interface Criterion {
  id: string;
  name: string;
  maxScore: number;
  description: string;
}

export default function QiymetlendirmePage() {
  const [teams, setTeams] = useState<AssignedTeam[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [noRound, setNoRound] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<AssignedTeam | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundId, setRoundId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [teamSubmission, setTeamSubmission] = useState<{
    title: string; description: string | null; problem: string | null;
    solution: string | null; demo_url: string | null; repo_url: string | null; video_url: string | null; presentation_url?: string | null;
  } | null>(null);
  const [teamFiles, setTeamFiles] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/jury-data');
        const data = await res.json();

        if (data.error === 'no_round' || data.error === 'no_assignments') {
          setNoRound(true);
          return;
        }
        if (data.error) return;

        setRoundId(data.roundId);
        setCriteria(data.criteria);
        setTeams(data.teams);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSelectTeam(team: AssignedTeam) {
    setSelectedTeam(team);
    setSaveMessage(null);
    setTeamSubmission(null);
    setTeamFiles([]);

    // Set scores from pre-loaded data
    const loadedScores: Record<string, number> = {};
    criteria.forEach(c => { loadedScores[c.id] = team.scores[c.id] ?? 0; });
    setScores(loadedScores);

    // Load team submission & files
    try {
      const res = await fetch(`/api/team-submission?teamId=${team.id}`);
      const data = await res.json();
      if (data.submission) setTeamSubmission(data.submission);
      if (data.files) setTeamFiles(data.files);
    } catch { /* ignore */ }
  }

  function handleScoreChange(criterionId: string, value: number, maxScore: number) {
    const clamped = Math.max(0, Math.min(maxScore, value));
    setScores(prev => ({ ...prev, [criterionId]: clamped }));
  }

  async function handleSave(submit: boolean) {
    if (!selectedTeam || !roundId) return;
    if (submit) setSubmitting(true); else setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/jury-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId, teamId: selectedTeam.id, scores, submit }),
      });
      const data = await res.json();

      if (data.error) {
        setSaveMessage('Xeta: ' + data.error);
      } else {
        const scoredCount = Object.values(scores).filter(v => v > 0).length;
        setTeams(prev => prev.map(t =>
          t.id === selectedTeam.id
            ? { ...t, scoredCriteria: submit ? criteria.length : scoredCount, isCompleted: submit ? true : t.isCompleted, scores }
            : t
        ));
        if (submit) {
          setSelectedTeam(prev => prev ? { ...prev, isCompleted: true, scoredCriteria: criteria.length } : null);
        }
        setSaveMessage(submit ? 'Qiymetlendirme ugurla gonderildi!' : 'Qaralama ugurla saxlanildi');
      }
    } catch {
      setSaveMessage('Xeta bas verdi');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  const totalScore = criteria.reduce((sum, c) => sum + (scores[c.id] ?? 0), 0);
  const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  if (noRound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#0D47A1]/10 p-2">
            <Scale className="size-5 text-[#0D47A1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Qiymetlendirme</h1>
            <p className="text-muted-foreground">Teyin olunmus komandalari qiymetlendirin</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Scale className="mb-3 size-12" />
            <p className="font-medium">Hazirda aktiv qiymetlendirme raund yoxdur</p>
            <p className="text-sm mt-1">Admin terefinden raund yaradilmalidir</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <Scale className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Qiymetlendirme</h1>
          <p className="text-muted-foreground">Teyin olunmus komandalari qiymetlendirin</p>
        </div>
      </div>

      {/* Teams list */}
      <Card>
        <CardHeader>
          <CardTitle>Teyin olunmus komandalar</CardTitle>
          <CardDescription>Qiymetlendirme ucun komanda secin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Hec bir komanda teyin olunmayib</p>
            )}
            {teams.map(team => {
              const progressPercent = criteria.length > 0 ? Math.round((team.scoredCriteria / criteria.length) * 100) : 0;
              const isComplete = team.isCompleted;
              const isSelected = selectedTeam?.id === team.id;

              return (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 ${isSelected ? 'border-[#0D47A1] bg-[#0D47A1]/5' : ''}`}
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
                        <span className="text-xs text-muted-foreground">{team.scoredCriteria} / {criteria.length} meyar</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={isComplete ? 'bg-[#6BBF6B] text-white' : team.scoredCriteria > 0 ? 'bg-amber-500 text-white' : ''}
                      variant={team.scoredCriteria === 0 ? 'secondary' : 'default'}>
                      {isComplete ? 'Tamamlandi' : team.scoredCriteria > 0 ? 'Davam edir' : 'Baslanmayib'}
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submission details */}
      {selectedTeam && teamSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-[#0D47A1]" />
              {teamSubmission.title || 'Teqdimat melumatlari'}
            </CardTitle>
            <CardDescription>{selectedTeam.name} komandasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamSubmission.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tesvir</p>
                <p className="text-sm">{teamSubmission.description}</p>
              </div>
            )}
            {teamSubmission.problem && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Problem</p>
                <p className="text-sm">{teamSubmission.problem}</p>
              </div>
            )}
            {teamSubmission.solution && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Hell</p>
                <p className="text-sm">{teamSubmission.solution}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {teamSubmission.presentation_url && (
                <a href={teamSubmission.presentation_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#0D47A1] hover:bg-[#0D47A1]/5">
                  <FileText className="size-3.5" /> Teqdimat <ExternalLink className="size-3" />
                </a>
              )}
              {teamSubmission.demo_url && (
                <a href={teamSubmission.demo_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#0D47A1] hover:bg-[#0D47A1]/5">
                  <Globe className="size-3.5" /> Demo <ExternalLink className="size-3" />
                </a>
              )}
              {teamSubmission.repo_url && (
                <a href={teamSubmission.repo_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#0D47A1] hover:bg-[#0D47A1]/5">
                  <GitBranch className="size-3.5" /> Repository <ExternalLink className="size-3" />
                </a>
              )}
              {teamSubmission.video_url && (
                <a href={teamSubmission.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#0D47A1] hover:bg-[#0D47A1]/5">
                  <Video className="size-3.5" /> Video <ExternalLink className="size-3" />
                </a>
              )}
            </div>
            {teamFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Yuklenmiş fayllar</p>
                <div className="space-y-2">
                  {teamFiles.map(f => (
                    <a key={f.name} href={f.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                      <FileText className="size-4 text-[#0D47A1] shrink-0" />
                      <span className="text-[#0D47A1]">{f.name}</span>
                      <ExternalLink className="size-3 text-muted-foreground ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scoring interface */}
      <Card className={selectedTeam ? '' : 'opacity-60'}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {selectedTeam ? <Star className="size-4 text-amber-500" /> : <Lock className="size-4 text-muted-foreground" />}
            <CardTitle>{selectedTeam ? `${selectedTeam.name} - Qiymetlendirme` : 'Qiymetlendirme interfeysi'}</CardTitle>
          </div>
          <CardDescription>{selectedTeam ? `${selectedTeam.track} track` : 'Yuxaridaki siyahidan komanda secin'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {criteria.map((criterion, i) => (
            <div key={criterion.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2 text-base">
                    <Star className="size-4 text-amber-500" />
                    {criterion.name}
                  </Label>
                  <p className="mt-0.5 text-sm text-muted-foreground">{criterion.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">/ {criterion.maxScore}</span>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number" min={0} max={criterion.maxScore} placeholder="0"
                  disabled={!selectedTeam}
                  value={scores[criterion.id] ?? ''}
                  onChange={e => handleScoreChange(criterion.id, parseInt(e.target.value) || 0, criterion.maxScore)}
                  className="w-24"
                />
                <div className="h-2 flex-1 rounded-full bg-muted">
                  {selectedTeam && (
                    <div className="h-2 rounded-full bg-[#0D47A1] transition-all"
                      style={{ width: `${((scores[criterion.id] ?? 0) / criterion.maxScore) * 100}%` }} />
                  )}
                </div>
              </div>
              {i !== criteria.length - 1 && <Separator />}
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">Umumi bal</p>
            <p className="text-2xl font-bold text-[#0D47A1]">{totalScore} / {maxTotalScore}</p>
          </div>

          {saveMessage && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
              saveMessage.includes('ugurla') ? 'border border-green-300 bg-green-50 text-green-800' : 'border border-amber-300 bg-amber-50 text-amber-800'
            }`}>
              {saveMessage.includes('ugurla') ? <Check className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
              <span>{saveMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={!selectedTeam || saving} onClick={() => handleSave(false)}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Qaralama saxla
            </Button>
            <Button disabled={!selectedTeam || submitting} className="bg-[#0D47A1] text-white" onClick={() => handleSave(true)}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Qiymetlendirmeni gonder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
