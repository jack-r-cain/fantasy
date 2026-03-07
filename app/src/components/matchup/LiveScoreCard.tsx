import { View, Text, StyleSheet } from 'react-native';
import type { Matchup, LeagueMember } from '../../types';

interface LiveScoreCardProps {
  matchup: Matchup;
  homeMember?: LeagueMember;
  awayMember?: LeagueMember;
}

export function LiveScoreCard({ matchup, homeMember, awayMember }: LiveScoreCardProps) {
  const homeTotal = matchup.home_score ? Object.values(matchup.home_score).reduce((a, b) => a + b, 0) : 0;
  const awayTotal = matchup.away_score ? Object.values(matchup.away_score).reduce((a, b) => a + b, 0) : 0;

  return (
    <View style={styles.card}>
      <View style={[styles.statusBar, matchup.status === 'active' && styles.statusLive]}>
        <Text style={styles.statusText}>{matchup.status === 'active' ? '● LIVE' : matchup.status.toUpperCase()}</Text>
        <Text style={styles.week}>Week {matchup.week_number}</Text>
      </View>
      <View style={styles.scores}>
        <View style={styles.team}>
          <Text style={styles.teamName}>{homeMember?.team_name ?? 'Home'}</Text>
          <Text style={[styles.score, homeTotal > awayTotal && styles.winning]}>{homeTotal.toFixed(1)}</Text>
        </View>
        <Text style={styles.vs}>vs</Text>
        <View style={styles.team}>
          <Text style={styles.teamName}>{awayMember?.team_name ?? 'Away'}</Text>
          <Text style={[styles.score, awayTotal > homeTotal && styles.winning]}>{awayTotal.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden' },
  statusBar: { backgroundColor: '#334155', padding: 8, flexDirection: 'row', justifyContent: 'space-between' },
  statusLive: { backgroundColor: '#166534' },
  statusText: { color: '#f8fafc', fontSize: 12, fontWeight: '600' },
  week: { color: '#94a3b8', fontSize: 12 },
  scores: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center' },
  teamName: { color: '#94a3b8', fontSize: 13, marginBottom: 4, textAlign: 'center' },
  score: { fontSize: 32, fontWeight: '700', color: '#f8fafc' },
  winning: { color: '#4ade80' },
  vs: { color: '#475569', fontSize: 14, marginHorizontal: 12 },
});
