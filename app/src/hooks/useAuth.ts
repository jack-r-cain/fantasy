import { useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../stores/useAuthStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        store.loadProfile();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        store.loadProfile();
      } else {
        useAuthStore.setState({ user: null, profile: null });
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
