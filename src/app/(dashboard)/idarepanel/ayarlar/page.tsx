'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Settings,
  Save,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { HackathonPhase } from '@/types/app.types';

/* -- Phase display map ---------------------------------------- */
const PHASE_LABELS: Record<HackathonPhase, string> = {
  draft: 'Qaralama',
  registration_open: 'Qeydiyyat aciq',
  registration_closed: 'Qeydiyyat bagli',
  selection: 'Secim',
  training: 'Telim',
  sprint: 'Sprint',
  judging: 'Qiymetlendirme',
  completed: 'Tamamlandi',
  archived: 'Arxivlendi',
};

const ALL_PHASES: HackathonPhase[] = [
  'draft',
  'registration_open',
  'registration_closed',
  'selection',
  'training',
  'sprint',
  'judging',
  'completed',
  'archived',
];

/* -- Form state type ------------------------------------------ */
interface HackathonForm {
  id: string;
  title: string;
  slug: string;
  description: string;
  current_phase: HackathonPhase;
  max_teams: number | null;
  min_team_size: number;
  max_team_size: number;
  registration_start: string; // date string YYYY-MM-DD
  registration_end: string;
  start_date: string;
  end_date: string;
}

/** Extract YYYY-MM-DD from an ISO timestamp, or return '' */
function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

/* -- Page component ------------------------------------------- */
export default function AyarlarPage() {
  const supabase = createClient();

  const [form, setForm] = useState<HackathonForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [fetchError, setFetchError] = useState(false);

  /* -- Fetch most recent hackathon ----------------------------- */
  const fetchHackathon = useCallback(async () => {
    setLoading(true);
    setFetchError(false);

    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      setFetchError(true);
      setLoading(false);
      return;
    }

    setForm({
      id: data.id,
      title: data.title ?? '',
      slug: data.slug ?? '',
      description: data.description ?? '',
      current_phase: (data.current_phase as HackathonPhase) ?? 'draft',
      max_teams: data.max_teams ?? null,
      min_team_size: data.min_team_size ?? 2,
      max_team_size: data.max_team_size ?? 5,
      registration_start: toDateInput(data.registration_start),
      registration_end: toDateInput(data.registration_end),
      start_date: toDateInput(data.start_date),
      end_date: toDateInput(data.end_date),
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchHackathon();
  }, [fetchHackathon]);

  /* -- Generic field updater ----------------------------------- */
  function updateField<K extends keyof HackathonForm>(
    key: K,
    value: HackathonForm[K],
  ) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    // Clear any previous feedback when the user starts editing again
    if (feedback) setFeedback(null);
  }

  /* -- Save handler -------------------------------------------- */
  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setFeedback(null);

    const { error } = await supabase
      .from('hackathons')
      .update({
        title: form.title,
        description: form.description,
        current_phase: form.current_phase,
        max_teams: form.max_teams,
        min_team_size: form.min_team_size,
        max_team_size: form.max_team_size,
        registration_start: form.registration_start || null,
        registration_end: form.registration_end || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      })
      .eq('id', form.id);

    setSaving(false);

    if (error) {
      setFeedback({
        type: 'error',
        message: `Xeta bas verdi: ${error.message}`,
      });
    } else {
      setFeedback({
        type: 'success',
        message: 'Deyisiklikler ugurla yadda saxlanildi!',
      });
    }
  }

  /* -- Loading state ------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[#0D47A1]" />
        <span className="ml-2 text-muted-foreground">Yuklenir...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <Settings className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hackathon Ayarlari
          </h1>
          <p className="text-muted-foreground">
            Hackathon konfiqurasiyasini idare et
          </p>
        </div>
      </div>

      {/* No-data banner */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Hackathon tapilmadi. Evvelce bir hackathon yaradilib-yaradilmadigini
            yoxlayin.
          </span>
        </div>
      )}

      {form && (
        <>
          {/* General settings */}
          <Card>
            <CardHeader>
              <CardTitle>Umumi melumatlar</CardTitle>
              <CardDescription>
                Hackathon haqqinda esas melumatlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Hackathon adi */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Hackathon adi</label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>

                {/* Slug (read-only -- changing slug can break URLs) */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Slug</label>
                  <Input value={form.slug} disabled />
                </div>

                {/* Tesvir */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">Tesvir</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Maks komanda sayi */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Maks komanda sayi
                  </label>
                  <Input
                    type="number"
                    value={form.max_teams ?? ''}
                    onChange={(e) =>
                      updateField(
                        'max_teams',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>

                {/* Min komanda olcusu */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Min komanda olcusu
                  </label>
                  <Input
                    type="number"
                    value={form.min_team_size}
                    onChange={(e) =>
                      updateField('min_team_size', Number(e.target.value) || 2)
                    }
                  />
                </div>

                {/* Maks komanda olcusu */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Maks komanda olcusu
                  </label>
                  <Input
                    type="number"
                    value={form.max_team_size}
                    onChange={(e) =>
                      updateField('max_team_size', Number(e.target.value) || 5)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date fields */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-[#2EC4B6]" />
                <CardTitle>Tarixler</CardTitle>
              </div>
              <CardDescription>
                Hackathon merehelerinin tarixleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Qeydiyyat acilisi
                  </label>
                  <Input
                    type="date"
                    value={form.registration_start}
                    onChange={(e) =>
                      updateField('registration_start', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Qeydiyyat baglanisi
                  </label>
                  <Input
                    type="date"
                    value={form.registration_end}
                    onChange={(e) =>
                      updateField('registration_end', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Baslangic tarixi
                  </label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Bitis tarixi</label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase selector */}
          <Card>
            <CardHeader>
              <CardTitle>Cari faza</CardTitle>
              <CardDescription>
                Hackathon-un hazirki merehesini secin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ALL_PHASES.map((phase) => {
                  const isCurrent = phase === form.current_phase;
                  return (
                    <Badge
                      key={phase}
                      variant={isCurrent ? 'default' : 'outline'}
                      className={
                        isCurrent
                          ? 'bg-[#0D47A1] text-white cursor-pointer'
                          : 'cursor-pointer opacity-60 hover:opacity-100 transition-opacity'
                      }
                      onClick={() => updateField('current_phase', phase)}
                    >
                      {PHASE_LABELS[phase]}
                    </Badge>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Hazirki faza:{' '}
                <span className="font-semibold">
                  {PHASE_LABELS[form.current_phase]}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-green-300 bg-green-50 text-green-800'
                  : 'border-red-300 bg-red-50 text-red-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <XCircle className="size-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? 'Saxlanilir...' : 'Yadda saxla'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
