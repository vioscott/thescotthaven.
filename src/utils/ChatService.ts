import { supabase } from './supabase';
import { User } from './storage';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    participant1_id: string;
    participant2_id: string;
    property_id?: string;
    updated_at: string;
    created_at: string;
    other_user?: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    last_message?: Message;
}

export const ChatService = {
    // Get all conversations for the current user
    async getConversations(userId: string): Promise<Conversation[]> {
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
        *,
        participant1:participant1_id(id, name, avatar_url),
        participant2:participant2_id(id, name, avatar_url)
      `)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Process conversations to identify the "other" user and fetch last message
        const processedConversations = await Promise.all(conversations.map(async (conv: any) => {
            const isParticipant1 = conv.participant1_id === userId;
            const otherUser = isParticipant1 ? conv.participant2 : conv.participant1;

            // Fetch last message
            const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1);

            return {
                ...conv,
                other_user: otherUser,
                last_message: messages?.[0] || null
            };
        }));

        return processedConversations;
    },

    // Get messages for a specific conversation
    async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Send a new message
    async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content
            })
            .select()
            .single();

        if (error) throw error;

        // Update conversation updated_at timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data;
    },

    // Create or get existing conversation
    async createConversation(currentUserId: string, otherUserId: string, propertyId?: string): Promise<string> {
        // Check if conversation already exists
        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`)
            .maybeSingle();

        if (existing) {
            return existing.id;
        }

        // Create new conversation
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                participant1_id: currentUserId,
                participant2_id: otherUserId,
                property_id: propertyId
            })
            .select('id')
            .single();

        if (error) throw error;
        return data.id;
    },

    // Subscribe to new messages in a conversation
    subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
        return supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    callback(payload.new as Message);
                }
            )
            .subscribe();
    },

    // Mark messages as read
    async markAsRead(conversationId: string, userId: string) {
        // Mark all messages in this conversation sent by the OTHER user as read
        // We need to find messages where sender_id != userId AND read = false
        const { error } = await supabase
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .eq('read', false);

        if (error) throw error;
    }
};
