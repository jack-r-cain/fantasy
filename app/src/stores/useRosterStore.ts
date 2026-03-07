import { create } from 'zustand';
import { api } from '../services/api';
import type { RosterEntry, WeeklyLineup, RosterSlot } from '../types';

interface RosterState {
  roster: RosterEntry[];
  weeklyLineup: WeeklyLineup | null;
  isLoading: boolean;
  error: string | null;
  fetchRoster: () => Promise<void>;
  fetchLineup: (weekNumber: number, seasonYear: number) => Promise<void>;
  submitLineup: (lineup: Record<RosterSlot, number>) => Promise<void>;
  addDrop: (addMlbId: number, dropMlbId: number) => Promise<void>;
}

export const useRosterStore = create<RosterState>((set) => ({
  roster: [],
  weeklyLineup: null,
  isLoading: false,
  error: null,

  fetchRoster: async () => {
    set({ isLoading: true, error: null });
    try {
      const roster = await api.get<RosterEntry[]>('/rosters/me');
      set({ roster, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchLineup: async (weekNumber, seasonYear) => {
    const lineup = await api.get<WeeklyLineup>(`/rosters/lineup?week=${weekNumber}&year=${seasonYear}`);
    set({ weeklyLineup: lineup });
  },

  submitLineup: async (lineup) => {
    const updated = await api.put<WeeklyLineup>('/rosters/lineup', { lineup });
    set({ weeklyLineup: updated });
  },

  addDrop: async (addMlbId, dropMlbId) => {
    await api.post('/rosters/add-drop', { add_player_mlb_id: addMlbId, drop_player_mlb_id: dropMlbId });
    // re-fetch roster after add/drop
    const roster = await api.get<RosterEntry[]>('/rosters/me');
    set({ roster });
  },
}));
