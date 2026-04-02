'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Clock,
  Circle,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import type { HackathonPhase } from '@/types/app.types';
import { createClient } from '@/lib/supabase/client';

/* ── Phase configuration ─────────────────────────────────── */
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

const PHASE_DESCRIPTIONS: Record<HackathonPhase, string> = {
  draft: 'Hackathon hazirlanir, melumatlar daxil edilir',
  registration_open: 'Komandalar qeydiyyatdan kece biler',
  registration_closed: 'Qeydiyyat sona catib, muracieler nezerden kecirilir',
  selection: 'Komandalar secilir ve tesdiq olunur',
  training: 'Telim sessiyalari ve mentorluq davam edir',
  sprint: 'Komandalar layiheleri uzerinde isleyir',
  judging: 'Munsifler layiheleri qiymetlendirir',
  completed: 'Hackathon tamamlandi, neticeler elan edildi',
  archived: 'Hackathon arxivlendi',
};

const PHASE_ORDER: HackathonPhase[] = [
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

export default function FazalarPage() {
  const [currentPhase, setCurrentPhase] = useState<HackathonPhase>('registration_open');
  const [hackathonId, setHackathonId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('hackathons')
      .select('id, current_phase')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setUseMock(true);
          return;
        }
        setHackathonId(data.id);
        setCurrentPhase(data.current_phase as HackathonPhase);
      });
  }, []);

  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  const nextPhase = currentIdx < PHASE_ORDER.length - 1 ? PHASE_ORDER[currentIdx + 1] : null;

  function handleAdvance() {
    if (!nextPhase) return;

    startTransition(async () => {
      if (hackathonId) {
        const supabase = createClient();
        const { error } = await supabase
          .from('hackathons')
          .update({ current_phase: nextPhase })
          .eq('id', hackathonId);

        if (error) {
          alert('Xeta bas verdi: ' + error.message);
          setConfirmOpen(false);
          return;
        }
      }
      setCurrentPhase(nextPhase);
      setConfirmOpen(false);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fazalar</h1>
          <p className="text-muted-foreground">
            Hackathon fazalarini idare edin ve novbeti merheleyekecidin
          </p>
        </div>
        <Badge
          variant="default"
          className="bg-[#0D47A1] text-white px-3 py-1 text-sm"
        >
          Cari faza: {PHASE_LABELS[currentPhase]}
        </Badge>
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

      {/* Phase stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Faza Zaman Cedveli</CardTitle>
          <CardDescription>
            Butun merheleler ve onlarin statuslari
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative ml-4">
            {PHASE_ORDER.map((phase, idx) => {
              const isCurrent = phase === currentPhase;
              const isPast = idx < currentIdx;
              const isFuture = idx > currentIdx;
              const isLast = idx === PHASE_ORDER.length - 1;

              return (
                <div key={phase} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[11px] top-[28px] w-0.5 h-[calc(100%-16px)] ${
                        isPast ? 'bg-[#6BBF6B]' : isCurrent ? 'bg-[#0D47A1]/30' : 'bg-gray-200'
                      }`}
                    />
                  )}

                  {/* Step icon */}
                  <div className="relative z-10 flex-shrink-0">
                    {isPast ? (
                      <div className="flex size-6 items-center justify-center rounded-full bg-[#6BBF6B]">
                        <CheckCircle2 className="size-4 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex size-6 items-center justify-center rounded-full bg-[#0D47A1] ring-4 ring-[#0D47A1]/20">
                        <Clock className="size-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="flex size-6 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                        <Circle className="size-3 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Step content */}
                  <div
                    className={`flex-1 rounded-lg border p-4 transition-colors ${
                      isCurrent
                        ? 'border-[#0D47A1]/30 bg-[#0D47A1]/5'
                        : isPast
                          ? 'border-[#6BBF6B]/20 bg-[#6BBF6B]/5'
                          : 'border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              isCurrent
                                ? 'text-[#0D47A1]'
                                : isPast
                                  ? 'text-[#6BBF6B]'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {PHASE_LABELS[phase]}
                          </h3>
                          {isCurrent && (
                            <Badge
                              variant="default"
                              className="bg-[#0D47A1] text-white text-xs"
                            >
                              Cari
                            </Badge>
                          )}
                          {isPast && (
                            <Badge
                              variant="default"
                              className="bg-[#6BBF6B] text-white text-xs"
                            >
                              Tamamlandi
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-sm mt-1 ${
                            isFuture ? 'text-muted-foreground/60' : 'text-muted-foreground'
                          }`}
                        >
                          {PHASE_DESCRIPTIONS[phase]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advance to next phase */}
      {nextPhase && (
        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-semibold">Novbeti faza</h3>
              <p className="text-sm text-muted-foreground">
                {PHASE_LABELS[currentPhase]} fazasindan{' '}
                <span className="font-medium text-[#0D47A1]">
                  {PHASE_LABELS[nextPhase]}
                </span>{' '}
                fazasina kecid edin
              </p>
            </div>
            <Button
              className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white"
              onClick={() => setConfirmOpen(true)}
            >
              Novbeti fazaya kec
              <ChevronRight className="size-4 ml-1" />
            </Button>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Faza kecidini tesdiq edin</DialogTitle>
                  <DialogDescription>
                    Bu emeliyyat hackathon-u{' '}
                    <strong>{PHASE_LABELS[currentPhase]}</strong> fazasindan{' '}
                    <strong>{PHASE_LABELS[nextPhase]}</strong> fazasina kecirecek.
                    Bu emeliyyati geri qaytarmaq mumkun olmaya biler.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    Legv et
                  </Button>
                  <Button
                    className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white"
                    onClick={handleAdvance}
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
                    Tesdiq et
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
