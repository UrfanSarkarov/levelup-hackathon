'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { publishResults } from './actions';

export function PublishResultsButton({ roundId, isPublished, allJudgesDone }: {
  roundId: string;
  isPublished: boolean;
  allJudgesDone: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  function handlePublish() {
    startTransition(async () => {
      const res = await publishResults(roundId);
      setResult(res);
      if (res.success) {
        setTimeout(() => setDialogOpen(false), 2000);
      }
    });
  }

  if (isPublished) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
        <CheckCircle2 className="size-4" />
        Neticeler elan edilib
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white"
      >
        <Send className="size-4 mr-2" />
        Neticeleri elan et
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neticeleri elan et</DialogTitle>
            <DialogDescription>
              Yekun neticeleri komandalara bildiris olaraq gonderilecek.
              Her komanda oz yerini gorecek (1-ci, 2-ci, 3-cu yer ve s.)
            </DialogDescription>
          </DialogHeader>

          {!allJudgesDone && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Diqqet: Butun munsiflər hele qiymetlendirmeni tamamlamayib.
              Yene de neticeleri elan ede bilersiniz.
            </div>
          )}

          {result?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {result.error}
            </div>
          )}

          {result?.success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="size-4" />
              Neticeler ugurla elan edildi!
            </div>
          )}

          {!result?.success && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Legv et</Button>
              <Button
                onClick={handlePublish}
                disabled={isPending}
                className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white"
              >
                {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Elan et ve bildiris gonder
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
