import { View, Text, FlatList, StyleSheet } from 'react-native';
import type { DraftPick, LeagueMember } from '../../types';

interface DraftBoardProps {
  picks: DraftPick[];
  members: LeagueMember[];
  totalRounds: number;
  teamCount: number;
}

export function DraftBoard({ picks, members, totalRounds, teamCount }: DraftBoardProps) {
  const rounds = Array.from({ length: Math.min(totalRounds, 5) }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Draft Board</Text>
      {rounds.map(round => {
        const roundPicks = picks.filter(p => Math.ceil(p.pick_number / teamCount) === round);
        return (
          <View key={round} style={styles.round}>
            <Text style={styles.roundLabel}>Round {round}</Text>
            <FlatList
              horizontal
              data={roundPicks}
              keyExtractor={p => p.id}
              renderItem={({ item }) => (
                <View style={styles.pick}>
                  <Text style={styles.pickNum}>#{item.pick_number}</Text>
                  <Text style={styles.pickName} numberOfLines={1}>{item.player?.full_name ?? `#${item.player_mlb_id}`}</Text>
                  <Text style={styles.pickPos}>{item.player?.position ?? ''}</Text>
                </View>
              )}
              ListEmptyComponent={<View style={styles.emptySlot} />}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  title: { color: '#f8fafc', fontWeight: '700', fontSize: 16, marginBottom: 12 },
  round: { marginBottom: 8 },
  roundLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  pick: { width: 80, backgroundColor: '#1e293b', borderRadius: 8, padding: 8, marginRight: 6 },
  pickNum: { color: '#64748b', fontSize: 10 },
  pickName: { color: '#f8fafc', fontSize: 11, marginTop: 2 },
  pickPos: { color: '#3b82f6', fontSize: 10, marginTop: 2 },
  emptySlot: { width: 80, height: 60, backgroundColor: '#0f1a2b', borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' },
});
