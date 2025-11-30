import { supabase } from './supabase';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    read: boolean;
    read_at?: string;
    attachment_url?: string;
    attachment_type?: 'image' | 'document';
    attachment_name?: string;
    system_message?: boolean;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    unread_count: number;
    updated_at: string;
}

export interface Conversation {
    id: string;
    participant1_id: string;
    participant2_id: string;
    property_id?: string;
    archived?: boolean;
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
    async getConversations(userId: string, includeArchived: boolean = false): Promise<Conversation[]> {
        let query = supabase
            .from('conversations')
            .select(`
        *,
        participant1:participant1_id(id, name, avatar_url),
        participant2:participant2_id(id, name, avatar_url)
      `)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

        // Filter archived conversations unless explicitly requested
        if (!includeArchived) {
            query = query.or('archived.is.null,archived.eq.false');
        }

        const { data: conversations, error } = await query.order('updated_at', { ascending: false });

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

    // Get messages for a specific conversation with pagination
    async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        // Reverse to show oldest first
        return data.reverse();
    },

    // Send a new message
    async sendMessage(
        conversationId: string,
        senderId: string,
        content: string,
        attachment?: { url: string; type: 'image' | 'document'; name: string }
    ): Promise<Message> {
        const messageData: any = {
            conversation_id: conversationId,
            sender_id: senderId,
            content
        };

        // Add attachment if provided
        if (attachment) {
            messageData.attachment_url = attachment.url;
            messageData.attachment_type = attachment.type;
            messageData.attachment_name = attachment.name;
        }

        const { data, error } = await supabase
            .from('messages')
            .insert(messageData)
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

    // Mark messages as read with timestamp
    async markAsRead(conversationId: string, userId: string) {
        const { error } = await supabase
            .from('messages')
            .update({
                read: true,
                read_at: new Date().toISOString()
            })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .eq('read', false);

        if (error) throw error;
    },

    // Archive a conversation
    async archiveConversation(conversationId: string): Promise<void> {
        const { error } = await supabase
            .from('conversations')
            .update({ archived: true })
            .eq('id', conversationId);

        if (error) throw error;
    },

    // Unarchive a conversation
    async unarchiveConversation(conversationId: string): Promise<void> {
        const { error } = await supabase
            .from('conversations')
            .update({ archived: false })
            .eq('id', conversationId);

        if (error) throw error;
    },

    // Send a system message (for welcome/goodbye)
    async sendSystemMessage(
        conversationId: string,
        content: string,
        senderId: string = '00000000-0000-0000-0000-000000000000'
    ): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content,
                system_message: true,
                read: true // System messages are always marked as read
            })
            .select()
            .single();

        if (error) throw error;

        // Update conversation timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data;
    },

    // Get unread message count for a user
    async getUnreadCount(userId: string): Promise<number> {
        const { data, error } = await supabase
            .from('notifications')
            .select('unread_count')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If no notification record exists, return 0
            if (error.code === 'PGRST116') return 0;
            throw error;
        }

        return data?.unread_count || 0;
    },

    // Subscribe to notification updates
    subscribeToNotifications(userId: string, callback: (count: number) => void) {
        return supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const notification = payload.new as Notification;
                    callback(notification?.unread_count || 0);
                }
            )
            .subscribe();
    },

    // Reset notification count (when user opens messages page)
    async resetNotificationCount(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .upsert({
                user_id: userId,
                unread_count: 0,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    }
};
