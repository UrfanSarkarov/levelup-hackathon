'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2 } from 'lucide-react';
import { bulkRejectUnselected } from './actions';

export function BulkRejectButton({ pendingCount, canReview }: { pendingCount: number; canReview: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (!canReview || pendingCount === 0) return null;

  function handleBulkReject() {
    if (!confirm(`${pendingCount} gozleyen komanda redd edilecek. Emin misiniz?`)) return;
    startTransition(async () => {
      const result = await bulkRejectUnselected();
      if (result.error) {
        alert('Xeta: ' + result.error);
      } else {
        alert(`${result.count} komanda redd edildi ve bildirisleri gonderildi.`);
      }
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleBulkReject}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 mr-1 animate-spin" />
      ) : (
        <XCircle className="size-4 mr-1" />
      )}
      Secilmeyenleri redd et ({pendingCount})
    </Button>
  );
}
