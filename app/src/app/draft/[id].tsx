import { useLocalSearchParams } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDraft } from '../../hooks/useDraft';
import { useAuthStore } from '../../stores/useAuthStore';

export default function DraftRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { draft, picks, availablePlayers, myQueue, isMyTurn, timer, makePick } = useDraft(id, id);

  if (!draft) return <View style={styles.center}><ActivityIndicator color="#3b82f6" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Draft Room</Text>
        <Text style={styles.subtitle}>Pick {draft.current_pick} · {draft.status.toUpperCase()}</Text>
        {isMyTurn && <View style={styles.yourTurnBadge}><Text style={styles.yourTurnText}>YOUR TURN — {timer}s</Text></View>}
      </View>

      <View style={styles.columns}>
        <View style={styles.leftCol}>
          <Text style={styles.colTitle}>Available Players</Text>
          <FlatList
            data={availablePlayers.slice(0, 30)}
            keyExtractor={p => String(p.mlb_id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.playerRow, isMyTurn && styles.playerRowActive]}
                onPress={() => isMyTurn && makePick(draft.id, item.mlb_id)}
                disabled={!isMyTurn}
              >
                <Text style={styles.pos}>{item.position}</Text>
                <Text style={styles.playerName}>{item.full_name}</Text>
                <Text style={styles.team}>{item.team}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.colTitle}>Picks ({picks.length})</Text>
          <FlatList
            data={[...picks].reverse()}
            keyExtractor={p => p.id}
            renderItem={({ item }) => (
              <View style={styles.pickRow}>
                <Text style={styles.pickNum}>#{item.pick_number}</Text>
                <Text style={styles.pickName}>{item.player?.full_name ?? `#${item.player_mlb_id}`}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '700', color: '#f8fafc' },
  subtitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  yourTurnBadge: { backgroundColor: '#16a34a', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8, alignSelf: 'flex-start' },
  yourTurnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  columns: { flex: 1, flexDirection: 'row' },
  leftCol: { flex: 3, borderRightWidth: 1, borderRightColor: '#1e293b' },
  rightCol: { flex: 2 },
  colTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '600', padding: 12 },
  playerRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  playerRowActive: { backgroundColor: '#0f2d4a' },
  pos: { color: '#3b82f6', fontWeight: '700', fontSize: 12, width: 32 },
  playerName: { color: '#f8fafc', fontSize: 14, flex: 1 },
  team: { color: '#64748b', fontSize: 12 },
  pickRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  pickNum: { color: '#64748b', fontSize: 12, width: 28 },
  pickName: { color: '#f8fafc', fontSize: 13, flex: 1 },
});
