import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatService } from '../utils/ChatService';
import { Bell } from 'lucide-react';

export function NotificationBadge() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const subscriptionRef = useRef<any>(null);
    const isPageVisible = useRef(true);

    useEffect(() => {
        // Check notification permission
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }

        // Track page visibility for browser notifications
        const handleVisibilityChange = () => {
            isPageVisible.current = !document.hidden;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        // Load initial unread count
        const loadUnreadCount = async () => {
            try {
                const count = await ChatService.getUnreadCount(user.id);
                setUnreadCount(count);
            } catch (error) {
                console.error('Error loading unread count:', error);
            }
        };

        loadUnreadCount();

        // Subscribe to real-time notification updates
        subscriptionRef.current = ChatService.subscribeToNotifications(user.id, (count) => {
            const previousCount = unreadCount;
            setUnreadCount(count);

            // Show browser notification if page is not visible and count increased
            if (!isPageVisible.current && count > previousCount && permission === 'granted') {
                showBrowserNotification();
            }
        });

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [user]);

    const requestNotificationPermission = async () => {
        if ('Notification' in window && permission === 'default') {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
    };

    const showBrowserNotification = () => {
        if ('Notification' in window && permission === 'granted') {
            new Notification('New Message', {
                body: 'You have a new message',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'new-message',
                renotify: false
            });
        }
    };

    // Auto-request permission on first render if not already set
    useEffect(() => {
        if (permission === 'default' && user) {
            // Wait a bit before requesting to not be too aggressive
            const timer = setTimeout(() => {
                requestNotificationPermission();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [permission, user]);

    if (!user || unreadCount === 0) return null;

    return (
        <div className="relative inline-block">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
            </span>
        </div>
    );
}
