import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Player, PlayerGameStats } from '../../types';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerGameStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Player>(`/players/${id}`),
      api.get<PlayerGameStats[]>(`/players/${id}/stats`),
    ]).then(([p, s]) => {
      setPlayer(p);
      setStats(s);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <View style={styles.center}><ActivityIndicator color="#3b82f6" /></View>;
  if (!player) return <View style={styles.center}><Text style={styles.empty}>Player not found</Text></View>;

  const recentStats = stats.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        {player.headshot_url ? (
          <Image source={{ uri: player.headshot_url }} style={styles.headshot} />
        ) : (
          <View style={styles.headshotPlaceholder} />
        )}
        <View style={styles.heroInfo}>
          <Text style={styles.name}>{player.full_name}</Text>
          <Text style={styles.team}>{player.team}</Text>
          <Text style={styles.pos}>{player.eligible_positions.join(' / ')}</Text>
          {player.status !== 'active' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{player.status.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Games</Text>
        {recentStats.length === 0 ? (
          <Text style={styles.empty}>No recent stats</Text>
        ) : (
          recentStats.map(s => (
            <View key={s.id} style={styles.statRow}>
              <Text style={styles.gameDate}>{s.game_date}</Text>
              <Text style={styles.fantasyPts}>{s.fantasy_points.toFixed(1)} pts</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  hero: { flexDirection: 'row', padding: 24, paddingTop: 60, gap: 16, alignItems: 'center' },
  headshot: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b' },
  headshotPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b' },
  heroInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  team: { color: '#64748b', fontSize: 14, marginTop: 2 },
  pos: { color: '#3b82f6', fontSize: 13, marginTop: 4 },
  statusBadge: { backgroundColor: '#7c3aed', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 6 },
  gameDate: { color: '#94a3b8', fontSize: 14 },
  fantasyPts: { color: '#f8fafc', fontWeight: '600' },
  empty: { color: '#64748b', fontSize: 14, textAlign: 'center', padding: 20 },
});
