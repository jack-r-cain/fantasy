import { View, Text, StyleSheet } from 'react-native';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <View style={[styles.container, isMe ? styles.containerMe : styles.containerThem]}>
      {!isMe && (
        <Text style={styles.sender}>{message.sender?.display_name ?? 'Unknown'}</Text>
      )}
      {message.message_type === 'system' ? (
        <Text style={styles.system}>{message.content}</Text>
      ) : (
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={styles.content}>{message.content}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8, maxWidth: '80%' },
  containerMe: { alignSelf: 'flex-end' },
  containerThem: { alignSelf: 'flex-start' },
  sender: { color: '#64748b', fontSize: 11, marginBottom: 2, marginLeft: 4 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#1d4ed8' },
  bubbleThem: { backgroundColor: '#1e293b' },
  content: { color: '#f8fafc', fontSize: 15 },
  system: { color: '#64748b', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: 4 },
});
