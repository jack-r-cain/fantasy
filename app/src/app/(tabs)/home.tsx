import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCurrentMatchup } from '../../hooks/useMatchup';
import { useLeagueStore } from '../../stores/useLeagueStore';

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const { matchup, isLoading: matchupLoading } = useCurrentMatchup();
  const { leagues, fetchLeagues } = useLeagueStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchLeagues(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await fetchLeagues();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, {profile?.display_name ?? 'Manager'} 👋</Text>
        <Text style={styles.subtitle}>Week overview</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Matchup</Text>
        {matchupLoading ? (
          <ActivityIndicator color="#3b82f6" />
        ) : matchup ? (
          <View style={styles.matchupCard}>
            <Text style={styles.matchupStatus}>{matchup.status.toUpperCase()}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.score}>{JSON.stringify(matchup.home_score ?? {})}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.score}>{JSON.stringify(matchup.away_score ?? {})}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.empty}>No active matchup</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Leagues</Text>
        {leagues.length === 0 ? (
          <Text style={styles.empty}>No leagues yet. Create or join one!</Text>
        ) : (
          leagues.map(l => (
            <View key={l.id} style={styles.leagueCard}>
              <Text style={styles.leagueName}>{l.name}</Text>
              <Text style={styles.leagueMeta}>{l.scoring_type} · {l.lineup_mode} lock</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#f8fafc' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 12 },
  matchupCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20 },
  matchupStatus: { color: '#3b82f6', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  score: { color: '#f8fafc', fontSize: 24, fontWeight: '700' },
  vs: { color: '#64748b', fontSize: 14 },
  leagueCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
  leagueName: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  leagueMeta: { color: '#64748b', fontSize: 13, marginTop: 4 },
  empty: { color: '#64748b', fontSize: 14, textAlign: 'center', padding: 20 },
});
