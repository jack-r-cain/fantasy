import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLeagueStore } from '../../stores/useLeagueStore';

export default function LeagueScreen() {
  const { activeLeague, members, fetchMembers } = useLeagueStore();
  const router = useRouter();

  useEffect(() => {
    if (activeLeague) fetchMembers(activeLeague.id);
  }, [activeLeague?.id]);

  if (!activeLeague) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Select a league to view</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Create League</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.leagueName}>{activeLeague.name}</Text>
        <Text style={styles.meta}>{activeLeague.scoring_type} · Season {activeLeague.season_year}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{activeLeague.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Standings ({members.length}/{activeLeague.max_teams})</Text>
        {members.map((m, i) => (
          <View key={m.id} style={styles.memberRow}>
            <Text style={styles.rank}>{i + 1}</Text>
            <Text style={styles.teamName}>{m.team_name}</Text>
            {m.is_commissioner && <View style={styles.commBadge}><Text style={styles.commText}>COMM</Text></View>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { padding: 24, paddingTop: 60 },
  leagueName: { fontSize: 28, fontWeight: '700', color: '#f8fafc' },
  meta: { fontSize: 14, color: '#64748b', marginTop: 4 },
  statusBadge: { backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, alignSelf: 'flex-start' },
  statusText: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 14, marginBottom: 8 },
  rank: { color: '#64748b', fontSize: 14, width: 24 },
  teamName: { color: '#f8fafc', fontSize: 15, flex: 1 },
  commBadge: { backgroundColor: '#fbbf24', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  commText: { color: '#0f172a', fontSize: 10, fontWeight: '700' },
  empty: { color: '#64748b', fontSize: 16, marginBottom: 24 },
  button: { backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
