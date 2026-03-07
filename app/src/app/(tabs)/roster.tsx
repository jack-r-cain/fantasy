import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRosterStore } from '../../stores/useRosterStore';
import { POSITION_ORDER } from '../../utils/positions';
import { getWeekNumber } from '../../utils/dates';

export default function RosterScreen() {
  const { roster, weeklyLineup, isLoading, fetchRoster, fetchLineup } = useRosterStore();

  useEffect(() => {
    fetchRoster();
    const now = new Date();
    fetchLineup(getWeekNumber(now), now.getFullYear());
  }, []);

  if (isLoading) return <View style={styles.center}><ActivityIndicator color="#3b82f6" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Roster</Text>
        {weeklyLineup?.is_locked && (
          <View style={styles.lockBadge}><Text style={styles.lockText}>LOCKED</Text></View>
        )}
      </View>

      {POSITION_ORDER.map(slot => {
        const entry = roster.find(r => r.roster_slot === slot);
        return (
          <View key={slot} style={styles.slotRow}>
            <View style={styles.slotLabel}>
              <Text style={styles.slotText}>{slot}</Text>
            </View>
            {entry ? (
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{entry.player?.full_name ?? `MLB #${entry.player_mlb_id}`}</Text>
                <Text style={styles.playerMeta}>{entry.player?.team} · {entry.player?.position}</Text>
              </View>
            ) : (
              <Text style={styles.empty}>Empty</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#f8fafc' },
  lockBadge: { backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  lockText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  slotRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1e293b', borderRadius: 12, padding: 14 },
  slotLabel: { width: 44 },
  slotText: { color: '#3b82f6', fontWeight: '700', fontSize: 13 },
  playerInfo: { flex: 1 },
  playerName: { color: '#f8fafc', fontSize: 15, fontWeight: '500' },
  playerMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  empty: { color: '#475569', fontSize: 14, fontStyle: 'italic' },
});
