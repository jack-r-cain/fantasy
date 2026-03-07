import { useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useChatStore } from '../stores/useChatStore';
import type { ChatMessage, ChannelType } from '../types';

export function useRealtimeChat(channelType: ChannelType, channelId: string) {
  const { addMessage } = useChatStore();

  useEffect(() => {
    const channelName = `${channelType}:${channelId}`;
    const channel = supabase.channel(channelName)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        addMessage(channelName, payload as ChatMessage);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [channelType, channelId, addMessage]);
}

export function useRealtimeScores(leagueId: string, onUpdate: (data: unknown) => void) {
  useEffect(() => {
    const channel = supabase.channel(`league:${leagueId}:scores`)
      .on('broadcast', { event: 'score_update' }, ({ payload }) => {
        onUpdate(payload);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [leagueId, onUpdate]);
}
