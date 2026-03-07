import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { Profile } from '../types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'push_token'>>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ isLoading: false, error: error.message }); return; }
    const u = data.user;
    set({ user: u ? { id: u.id, email: u.email! } : null, isLoading: false });
    await get().loadProfile();
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { set({ isLoading: false, error: error.message }); return; }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, display_name: displayName });
      set({ user: { id: data.user.id, email: data.user.email! }, isLoading: false });
      await get().loadProfile();
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  loadProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) set({ profile: data as Profile, user: { id: user.id, email: user.email! } });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();
    if (!error && data) set({ profile: data as Profile });
  },

  clearError: () => set({ error: null }),
}));
