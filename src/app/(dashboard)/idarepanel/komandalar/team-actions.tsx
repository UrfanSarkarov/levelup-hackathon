'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Undo2, Loader2, Trophy } from 'lucide-react';
import { updateTeamStatus, addTeamToFinalist, removeTeamFromFinalist } from './actions';

export function TeamActions({ teamId, status, canReview, isFinalist }: {
  teamId: string; status: string; canReview: boolean; isFinalist?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(newStatus: 'accepted' | 'rejected' | 'pending') {
    startTransition(async () => {
      const result = await updateTeamStatus(teamId, newStatus);
      if (result.error) alert('Xeta: ' + result.error);
    });
  }

  function handleFinalist() {
    startTransition(async () => {
      const result = await addTeamToFinalist(teamId);
      if (result.error) alert(result.error);
    });
  }

  function handleRemoveFinalist() {
    startTransition(async () => {
      const result = await removeTeamFromFinalist(teamId);
      if (result.error) alert(result.error);
    });
  }

  if (isPending) {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  }

  if (status === 'pending') {
    if (!canReview) {
      return <span className="text-xs text-muted-foreground">Qeydiyyat baglanandan sonra</span>;
    }
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => handleStatus('accepted')} title="Qebul et">
          <Check className="size-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleStatus('rejected')} title="Redd et">
          <X className="size-3.5" />
        </Button>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="flex gap-1">
        {isFinalist ? (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={handleRemoveFinalist} title="Finaldan cixar">
            <Trophy className="size-3.5 mr-1 fill-amber-500" />
            <span className="text-xs">Finalist</span>
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={handleFinalist} title="Finala kecir">
            <Trophy className="size-3.5 mr-1" />
            <span className="text-xs">Final</span>
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => handleStatus('pending')} title="Geri qaytar">
          <Undo2 className="size-3.5" />
        </Button>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => handleStatus('pending')} title="Geri qaytar">
        <Undo2 className="size-3.5 mr-1" />
        <span className="text-xs">Geri</span>
      </Button>
    );
  }

  return null;
}
