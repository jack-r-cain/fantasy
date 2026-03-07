import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Matchup } from '../types';

export function useMatchup(matchupId?: string) {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchupId) return;
    setIsLoading(true);
    api.get<Matchup>(`/matchups/${matchupId}/scores`)
      .then(setMatchup)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [matchupId]);

  return { matchup, isLoading, error };
}

export function useCurrentMatchup() {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.get<Matchup>('/matchups/current')
      .then(setMatchup)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { matchup, isLoading };
}
