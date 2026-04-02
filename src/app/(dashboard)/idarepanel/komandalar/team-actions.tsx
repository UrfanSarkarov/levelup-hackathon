'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { updateTeamStatus } from './actions';

export function TeamActions({ teamId, status }: { teamId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  if (status !== 'pending') return null;

  function handle(newStatus: 'accepted' | 'rejected') {
    startTransition(async () => {
      const result = await updateTeamStatus(teamId, newStatus);
      if (result.error) {
        alert('Xeta: ' + result.error);
      }
    });
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => handle('accepted')}
        disabled={isPending}
        title="Qebul et"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => handle('rejected')}
        disabled={isPending}
        title="Redd et"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
