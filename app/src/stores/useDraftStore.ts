import { create } from 'zustand';
import { api } from '../services/api';
import type { Draft, DraftPick, Player } from '../types';

interface DraftState {
  draft: Draft | null;
  picks: DraftPick[];
  availablePlayers: Player[];
  myQueue: number[]; // mlb_ids
  timer: number;
  isMyTurn: boolean;
  isLoading: boolean;
  fetchDraft: (leagueId: string) => Promise<void>;
  makePick: (draftId: string, playerMlbId: number) => Promise<void>;
  addToQueue: (mlbId: number) => void;
  removeFromQueue: (mlbId: number) => void;
  reorderQueue: (from: number, to: number) => void;
  setTimer: (seconds: number) => void;
  setIsMyTurn: (v: boolean) => void;
  addPick: (pick: DraftPick) => void;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  draft: null,
  picks: [],
  availablePlayers: [],
  myQueue: [],
  timer: 0,
  isMyTurn: false,
  isLoading: false,

  fetchDraft: async (leagueId) => {
    set({ isLoading: true });
    const [draft, board] = await Promise.all([
      api.get<Draft>(`/leagues/${leagueId}/draft`),
      api.get<{ picks: DraftPick[]; available: Player[] }>(`/drafts/${leagueId}/board`),
    ]);
    set({ draft, picks: board.picks, availablePlayers: board.available, isLoading: false });
  },

  makePick: async (draftId, playerMlbId) => {
    const pick = await api.post<DraftPick>(`/drafts/${draftId}/pick`, { player_mlb_id: playerMlbId });
    set((s) => ({
      picks: [...s.picks, pick],
      availablePlayers: s.availablePlayers.filter(p => p.mlb_id !== playerMlbId),
    }));
  },

  addToQueue: (mlbId) => set((s) => ({ myQueue: [...s.myQueue, mlbId] })),
  removeFromQueue: (mlbId) => set((s) => ({ myQueue: s.myQueue.filter(id => id !== mlbId) })),
  reorderQueue: (from, to) => set((s) => {
    const q = [...s.myQueue];
    const [item] = q.splice(from, 1);
    q.splice(to, 0, item);
    return { myQueue: q };
  }),
  setTimer: (seconds) => set({ timer: seconds }),
  setIsMyTurn: (v) => set({ isMyTurn: v }),
  addPick: (pick) => set((s) => ({
    picks: [...s.picks, pick],
    availablePlayers: s.availablePlayers.filter(p => p.mlb_id !== pick.player_mlb_id),
  })),
}));
