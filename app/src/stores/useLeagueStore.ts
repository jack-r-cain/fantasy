import { create } from 'zustand';
import { api } from '../services/api';
import type { League, LeagueMember } from '../types';

interface LeagueState {
  leagues: League[];
  activeLeague: League | null;
  members: LeagueMember[];
  myMember: LeagueMember | null;
  isLoading: boolean;
  error: string | null;
  fetchLeagues: () => Promise<void>;
  setActiveLeague: (league: League) => void;
  fetchMembers: (leagueId: string) => Promise<void>;
  createLeague: (payload: Partial<League>) => Promise<League>;
  joinLeague: (inviteCode: string) => Promise<void>;
  clearError: () => void;
}

export const useLeagueStore = create<LeagueState>((set, get) => ({
  leagues: [],
  activeLeague: null,
  members: [],
  myMember: null,
  isLoading: false,
  error: null,

  fetchLeagues: async () => {
    set({ isLoading: true, error: null });
    try {
      const leagues = await api.get<League[]>('/leagues');
      set({ leagues, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  setActiveLeague: (league) => set({ activeLeague: league }),

  fetchMembers: async (leagueId) => {
    const members = await api.get<LeagueMember[]>(`/leagues/${leagueId}/members`);
    set({ members });
  },

  createLeague: async (payload) => {
    const league = await api.post<League>('/leagues', payload);
    set((s) => ({ leagues: [...s.leagues, league] }));
    return league;
  },

  joinLeague: async (inviteCode) => {
    const league = await api.post<League>('/leagues/join', { invite_code: inviteCode });
    set((s) => ({ leagues: [...s.leagues, league] }));
  },

  clearError: () => set({ error: null }),
}));
