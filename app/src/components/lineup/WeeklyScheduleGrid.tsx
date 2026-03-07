import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { MLBGame } from '../../types';

interface WeeklyScheduleGridProps {
  games: MLBGame[];
  teamAbbr: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyScheduleGrid({ games, teamAbbr }: WeeklyScheduleGridProps) {
  function getGameForDay(dayIndex: number): MLBGame | undefined {
    return games.find(g => {
      const d = new Date(g.game_date).getDay();
      const adjusted = d === 0 ? 6 : d - 1;
      return adjusted === dayIndex;
    });
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.grid}>
        {DAYS.map((day, i) => {
          const game = getGameForDay(i);
          const isHome = game?.home_team === teamAbbr;
          return (
            <View key={day} style={styles.cell}>
              <Text style={styles.dayLabel}>{day}</Text>
              {game ? (
                <>
                  <Text style={styles.opponent}>{isHome ? game.away_team : `@${game.home_team}`}</Text>
                  <View style={[styles.dot, game.status === 'final' ? styles.dotFinal : styles.dotScheduled]} />
                </>
              ) : (
                <Text style={styles.off}>OFF</Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 2 },
  cell: { width: 48, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 8, padding: 8 },
  dayLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  opponent: { color: '#f8fafc', fontSize: 11, textAlign: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  dotScheduled: { backgroundColor: '#3b82f6' },
  dotFinal: { backgroundColor: '#16a34a' },
  off: { color: '#334155', fontSize: 11 },
});
