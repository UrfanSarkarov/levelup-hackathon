'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteRejectedTeams, deleteNonAcceptedTeams } from './actions';

export function DeleteTeamsButton({ rejectedCount, nonAcceptedCount }: { rejectedCount: number; nonAcceptedCount: number }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'rejected' | 'all-test'>('rejected');
  const [confirmText, setConfirmText] = useState('');

  if (rejectedCount === 0 && nonAcceptedCount === 0) return null;

  const expectedConfirm = mode === 'rejected' ? 'SIL' : 'HAMISINI-SIL';
  const currentCount = mode === 'rejected' ? rejectedCount : nonAcceptedCount;

  function handleDelete() {
    if (confirmText !== expectedConfirm) {
      alert(`Zehmet olmasa "${expectedConfirm}" yazin`);
      return;
    }
    startTransition(async () => {
      const result = mode === 'rejected'
        ? await deleteRejectedTeams()
        : await deleteNonAcceptedTeams();
      if (result.error) {
        alert('Xeta: ' + result.error);
      } else {
        alert(`${result.count} komanda silindi.`);
        setOpen(false);
        setConfirmText('');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
          <Trash2 className="size-4 mr-1" />
          Test datalarini temizle
        </Button>
      } />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            Komandalari sil
          </DialogTitle>
          <DialogDescription>
            Bu emeliyyat geri qaytarila bilmez. Test datalarini silmeden once diqqetli olun.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                checked={mode === 'rejected'}
                onChange={() => { setMode('rejected'); setConfirmText(''); }}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Yalniz redd edilmis komandalari sil</p>
                <p className="text-xs text-muted-foreground">
                  {rejectedCount} redd edilmis komanda ve onlara aid butun datalar (uzvler, teqdimatlar, qiymetler) silinecek.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                checked={mode === 'all-test'}
                onChange={() => { setMode('all-test'); setConfirmText(''); }}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Butun qebul edilmeyen komandalari sil</p>
                <p className="text-xs text-muted-foreground">
                  {nonAcceptedCount} komanda (gozleyen, redd edilmis, qaralama, diskvalifikasiya) ve onlarin butun datalari silinecek. Yalniz qebul edilmis komandalar qalacaq.
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Tesdiqlemek ucun &quot;{expectedConfirm}&quot; yazin:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedConfirm}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { setOpen(false); setConfirmText(''); }} disabled={isPending}>
            Legv et
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || confirmText !== expectedConfirm || currentCount === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Silinir...
              </>
            ) : (
              <>
                <Trash2 className="size-4 mr-1" />
                {currentCount} komandani sil
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
