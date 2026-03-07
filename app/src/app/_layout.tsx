import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const { user, loadProfile } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)/home');
    }
  }, [user, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="draft/[id]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="trade/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="player/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
