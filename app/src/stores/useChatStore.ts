import { create } from 'zustand';
import { api } from '../services/api';
import type { ChatMessage, ChannelType } from '../types';

interface ChatState {
  messages: Record<string, ChatMessage[]>; // keyed by channelKey
  isLoading: boolean;
  fetchMessages: (channelType: ChannelType, channelId: string) => Promise<void>;
  sendMessage: (channelType: ChannelType, channelId: string, content: string, messageType?: string) => Promise<void>;
  addMessage: (channelKey: string, message: ChatMessage) => void;
}

function channelKey(type: ChannelType, id: string) { return `${type}:${id}`; }

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  isLoading: false,

  fetchMessages: async (channelType, channelId) => {
    set({ isLoading: true });
    const msgs = await api.get<ChatMessage[]>(`/chat/${channelType}/${channelId}`);
    set((s) => ({ messages: { ...s.messages, [channelKey(channelType, channelId)]: msgs }, isLoading: false }));
  },

  sendMessage: async (channelType, channelId, content, messageType = 'text') => {
    await api.post(`/chat/${channelType}/${channelId}`, { content, message_type: messageType });
  },

  addMessage: (key, message) => set((s) => ({
    messages: { ...s.messages, [key]: [...(s.messages[key] ?? []), message] },
  })),
}));
