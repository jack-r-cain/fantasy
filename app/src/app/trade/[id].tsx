import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Trade } from '../../types';

export default function TradeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trade, setTrade] = useState<Trade | null>(null);

  useEffect(() => {
    api.get<Trade>(`/trades/${id}`).then(setTrade).catch(() => {});
  }, [id]);

  if (!trade) return <View style={styles.center}><Text style={styles.empty}>Loading trade...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trade Proposal</Text>
        <View style={[styles.statusBadge, { backgroundColor: trade.status === 'pending' ? '#f59e0b' : trade.status === 'accepted' ? '#16a34a' : '#ef4444' }]}>
          <Text style={styles.statusText}>{trade.status.toUpperCase()}</Text>
        </View>
      </View>

      {trade.assets?.map(asset => (
        <View key={asset.id} style={styles.assetRow}>
          <Text style={styles.assetText}>
            {asset.player?.full_name ?? `Player #${asset.player_mlb_id}`}
          </Text>
          <Text style={styles.direction}>→ to {asset.to_member_id.slice(0, 8)}...</Text>
        </View>
      ))}

      {trade.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => api.put(`/trades/${id}/accept`, {}).then(t => setTrade(t as Trade))}>
            <Text style={styles.actionText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => api.put(`/trades/${id}/reject`, {}).then(t => setTrade(t as Trade))}>
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#f8fafc' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  assetRow: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1e293b', borderRadius: 12, padding: 16 },
  assetText: { color: '#f8fafc', fontSize: 15, fontWeight: '500' },
  direction: { color: '#64748b', fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, padding: 16 },
  acceptBtn: { flex: 1, backgroundColor: '#16a34a', borderRadius: 12, padding: 14, alignItems: 'center' },
  rejectBtn: { flex: 1, backgroundColor: '#ef4444', borderRadius: 12, padding: 14, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  empty: { color: '#64748b' },
});
