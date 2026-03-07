import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚾</Text> }} />
      <Tabs.Screen name="league" options={{ title: 'League', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text> }} />
      <Tabs.Screen name="roster" options={{ title: 'Roster', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }} />
      <Tabs.Screen name="players" options={{ title: 'Players', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text> }} />
    </Tabs>
  );
}
