import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import type { Player } from '../../types';

export default function PlayersScreen() {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setPlayers([]); return; }
    setIsLoading(true);
    try {
      const results = await api.get<Player[]>(`/players/search?q=${encodeURIComponent(q)}`);
      setPlayers(results);
    } catch {
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Players</Text>
      </View>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search players..."
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      {isLoading && <ActivityIndicator color="#3b82f6" style={styles.loader} />}
      <FlatList
        data={players}
        keyExtractor={p => String(p.mlb_id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playerRow}
            onPress={() => router.push(`/player/${item.mlb_id}`)}
          >
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{item.position}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.meta}>{item.team}</Text>
            </View>
            {item.status !== 'active' && (
              <View style={styles.ilBadge}>
                <Text style={styles.ilText}>IL</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 1 && !isLoading ? (
            <Text style={styles.empty}>No players found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#f8fafc' },
  searchBar: { paddingHorizontal: 16, marginBottom: 8 },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 16 },
  loader: { marginTop: 16 },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1e293b', borderRadius: 12, padding: 14 },
  positionBadge: { backgroundColor: '#1d4ed8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 12 },
  positionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: '#f8fafc', fontSize: 15, fontWeight: '500' },
  meta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  ilBadge: { backgroundColor: '#7c3aed', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  ilText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  empty: { color: '#64748b', textAlign: 'center', padding: 24 },
});
