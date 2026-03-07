import { useEffect } from 'react';
import { useLeagueStore } from '../stores/useLeagueStore';

export function useLeague(leagueId?: string) {
  const store = useLeagueStore();

  useEffect(() => {
    store.fetchLeagues();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leagueId) store.fetchMembers(leagueId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  return store;
}
