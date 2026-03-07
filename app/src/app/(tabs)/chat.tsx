import { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLeagueStore } from '../../stores/useLeagueStore';
import { useChatStore } from '../../stores/useChatStore';
import { useRealtimeChat } from '../../hooks/useRealtime';
import { useAuthStore } from '../../stores/useAuthStore';
import { formatDate } from '../../utils/dates';

export default function ChatScreen() {
  const { activeLeague } = useLeagueStore();
  const { messages, fetchMessages, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const channelKey = activeLeague ? `league:${activeLeague.id}` : null;
  const msgs = channelKey ? (messages[channelKey] ?? []) : [];

  useRealtimeChat('league', activeLeague?.id ?? '');

  useEffect(() => {
    if (activeLeague) fetchMessages('league', activeLeague.id);
  }, [activeLeague?.id]);

  async function handleSend() {
    if (!text.trim() || !activeLeague) return;
    await sendMessage('league', activeLeague.id, text.trim());
    setText('');
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeLeague?.name ?? 'Chat'}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={msgs}
        keyExtractor={m => m.id}
        renderItem={({ item }) => {
          const isMe = item.sender_id === user?.id;
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              {!isMe && <Text style={styles.sender}>{item.sender?.display_name ?? 'User'}</Text>}
              <Text style={styles.messageText}>{item.content}</Text>
              <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
            </View>
          );
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor="#64748b"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  list: { paddingHorizontal: 16, paddingBottom: 8 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 8 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#1d4ed8' },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: '#1e293b' },
  sender: { color: '#94a3b8', fontSize: 11, marginBottom: 4 },
  messageText: { color: '#f8fafc', fontSize: 15 },
  timestamp: { color: '#64748b', fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8 },
  input: { flex: 1, backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendButton: { backgroundColor: '#3b82f6', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '600' },
});
