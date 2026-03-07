import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useDraftStore } from '../stores/useDraftStore';
import type { DraftPick } from '../types';

export function useDraft(leagueId: string, draftId: string) {
  const store = useDraftStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    store.fetchDraft(leagueId);

    const channel = supabase.channel(`draft:${draftId}`)
      .on('broadcast', { event: 'pick' }, ({ payload }) => {
        store.addPick(payload as DraftPick);
      })
      .on('broadcast', { event: 'timer' }, ({ payload }) => {
        store.setTimer((payload as { seconds: number }).seconds);
      })
      .on('broadcast', { event: 'your_turn' }, () => {
        store.setIsMyTurn(true);
      })
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId, draftId]);

  return store;
}
