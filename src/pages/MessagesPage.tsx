import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatService, Conversation, Message } from '../utils/ChatService';
import { Send, User as UserIcon, MessageSquare, ArrowLeft } from 'lucide-react';

export function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);

    // Fetch conversations on mount
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Subscribe to real-time updates when a conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);

            // Unsubscribe from previous subscription if exists
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }

            // Subscribe to new messages
            subscriptionRef.current = ChatService.subscribeToMessages(selectedConversation.id, (message) => {
                setMessages((prev) => [...prev, message]);
                // Also update the conversation list to show the new last message
                loadConversations();
            });

            return () => {
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                }
            };
        }
    }, [selectedConversation]);

    const loadConversations = async () => {
        if (!user) return;
        try {
            const data = await ChatService.getConversations(user.id);
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const data = await ChatService.getMessages(conversationId);
            setMessages(data);
            // Mark as read
            if (user) {
                await ChatService.markAsRead(conversationId, user.id);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !user) return;

        setSending(true);
        try {
            await ChatService.sendMessage(selectedConversation.id, user.id, newMessage);
            setNewMessage('');
            // Message will be added via realtime subscription
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4 sm:px-6 lg:px-8 h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex">

                {/* Conversations List Sidebar */}
                <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col border-r border-gray-200`}>
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No conversations yet.</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${selectedConversation?.id === conv.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {conv.other_user?.avatar_url ? (
                                                <img src={conv.other_user.avatar_url} alt={conv.other_user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-medium text-gray-900 truncate">{conv.other_user?.name || 'Unknown User'}</h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {conv.last_message ? new Date(conv.last_message.created_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${conv.last_message && !conv.last_message.read && conv.last_message.sender_id !== user.id
                                                ? 'font-semibold text-gray-900'
                                                : 'text-gray-500'
                                            }`}>
                                            {conv.last_message?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col bg-white`}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {selectedConversation.other_user?.avatar_url ? (
                                        <img src={selectedConversation.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedConversation.other_user?.name}</h3>
                                    <p className="text-xs text-gray-500">Online</p>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                                }`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
                            <p className="max-w-sm text-center mt-2">Select a conversation from the list to start chatting or view your message history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
