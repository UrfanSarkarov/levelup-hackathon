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
import { AlertTriangle, Settings, Save, Calendar } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import type { HackathonPhase } from '@/types/app.types';

/* ── Phase display map ────────────────────────────────────── */
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

/* ── Mock config ──────────────────────────────────────────── */
interface HackathonConfig {
  title: string;
  slug: string;
  description: string;
  phase: HackathonPhase;
  max_teams: number;
  min_team_size: number;
  max_team_size: number;
  registration_open: string;
  registration_close: string;
  selection_date: string;
  training_start: string;
  sprint_start: string;
  sprint_end: string;
}

const MOCK_CONFIG: HackathonConfig = {
  title: 'Level UP Hackathon 2026',
  slug: 'levelup-2026',
  description:
    'Azerbaycanin en boyuk hackathon platformasi. Yenilikci ideyalarinizi real layihelere cevirin.',
  phase: 'registration_open',
  max_teams: 50,
  min_team_size: 2,
  max_team_size: 5,
  registration_open: '2026-03-15',
  registration_close: '2026-04-15',
  selection_date: '2026-04-20',
  training_start: '2026-04-25',
  sprint_start: '2026-05-01',
  sprint_end: '2026-05-15',
};

/* ── Page ─────────────────────────────────────────────────── */
export default async function AyarlarPage() {
  let useMock = false;
  let config: HackathonConfig = MOCK_CONFIG;

  try {
    const supabase = createServiceClient();

    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !hackathon) throw new Error('no hackathon');

    config = {
      title: hackathon.title ?? MOCK_CONFIG.title,
      slug: hackathon.slug ?? MOCK_CONFIG.slug,
      description: hackathon.description ?? MOCK_CONFIG.description,
      phase: (hackathon.current_phase as HackathonPhase) ?? MOCK_CONFIG.phase,
      max_teams: hackathon.max_teams ?? MOCK_CONFIG.max_teams,
      min_team_size: hackathon.min_team_size ?? MOCK_CONFIG.min_team_size,
      max_team_size: hackathon.max_team_size ?? MOCK_CONFIG.max_team_size,
      registration_open: hackathon.registration_start?.slice(0, 10) ?? MOCK_CONFIG.registration_open,
      registration_close: hackathon.registration_end?.slice(0, 10) ?? MOCK_CONFIG.registration_close,
      selection_date: MOCK_CONFIG.selection_date,
      training_start: hackathon.start_date?.slice(0, 10) ?? MOCK_CONFIG.training_start,
      sprint_start: MOCK_CONFIG.sprint_start,
      sprint_end: hackathon.end_date?.slice(0, 10) ?? MOCK_CONFIG.sprint_end,
    };
  } catch {
    useMock = true;
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
            Hackathon konfiqurasiyasini idareet
          </p>
        </div>
      </div>

      {/* Mock-data banner */}
      {useMock && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Supabase baglantisi qurulmayib — demo melumatlar gosterilir
          </span>
        </div>
      )}

      {/* General settings */}
      <Card>
        <CardHeader>
          <CardTitle>Umumi melumatlar</CardTitle>
          <CardDescription>Hackathon haqqinda esas melumatlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Hackathon adi */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Hackathon adi</label>
              <Input defaultValue={config.title} disabled />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Slug</label>
              <Input defaultValue={config.slug} disabled />
            </div>

            {/* Tesvir */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Tesvir</label>
              <Textarea
                defaultValue={config.description}
                rows={3}
                disabled
              />
            </div>

            {/* Maks komanda sayi */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Maks komanda sayi</label>
              <Input
                type="number"
                defaultValue={config.max_teams}
                disabled
              />
            </div>

            {/* Min komanda olcusu */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Min komanda olcusu
              </label>
              <Input
                type="number"
                defaultValue={config.min_team_size}
                disabled
              />
            </div>

            {/* Maks komanda olcusu */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Maks komanda olcusu
              </label>
              <Input
                type="number"
                defaultValue={config.max_team_size}
                disabled
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
          <CardDescription>Hackathon merehelerinin tarixleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Qeydiyyat acilisi</label>
              <Input
                type="date"
                defaultValue={config.registration_open}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Qeydiyyat baglanisi
              </label>
              <Input
                type="date"
                defaultValue={config.registration_close}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Secim tarixi</label>
              <Input
                type="date"
                defaultValue={config.selection_date}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Telim baslangici
              </label>
              <Input
                type="date"
                defaultValue={config.training_start}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Sprint baslangici
              </label>
              <Input
                type="date"
                defaultValue={config.sprint_start}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sprint sonu</label>
              <Input
                type="date"
                defaultValue={config.sprint_end}
                disabled
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
              const isCurrent = phase === config.phase;
              return (
                <Badge
                  key={phase}
                  variant={isCurrent ? 'default' : 'outline'}
                  className={
                    isCurrent
                      ? 'bg-[#0D47A1] text-white'
                      : 'cursor-not-allowed opacity-60'
                  }
                >
                  {PHASE_LABELS[phase]}
                </Badge>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Faza deyismesi hazirda deaktivdir
          </p>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button disabled className="gap-2">
          <Save className="size-4" />
          Yadda saxla
        </Button>
      </div>
    </div>
  );
}
