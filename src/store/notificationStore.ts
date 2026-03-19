'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationState {
    notifications: any[];
    unreadCount: number;
    isLoading: boolean;
    _channel: RealtimeChannel | null;
    loadNotifications: (userId: string) => Promise<void>;
    markRead: (notificationId: string) => Promise<void>;
    markAllRead: (userId: string) => Promise<void>;
    addNotification: (notif: Record<string, any>) => Promise<void>;
    subscribe: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    _channel: null,

    loadNotifications: async (userId) => {
        try {
            set({ isLoading: true });
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const notifications = data || [];
            const unreadCount = notifications.filter((n: any) => !n.is_read).length;
            set({ notifications, unreadCount, isLoading: false });
        } catch (error) {
            console.error('Failed to load notifications:', error);
            set({ isLoading: false });
        }
    },

    markRead: async (notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;

            set((s) => {
                const found = s.notifications.find((n: any) => n.id === notificationId && !n.is_read);
                return {
                    notifications: s.notifications.map((n: any) =>
                        n.id === notificationId ? { ...n, is_read: true } : n
                    ),
                    unreadCount: found ? s.unreadCount - 1 : s.unreadCount,
                };
            });
        } catch (error) {
            console.error('Failed to mark notification read:', error);
        }
    },

    markAllRead: async (userId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;

            set((s) => ({
                notifications: s.notifications.map((n: any) => ({ ...n, is_read: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Failed to mark all notifications read:', error);
        }
    },

    addNotification: async (notif) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notif)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                set((s) => ({
                    notifications: [data, ...s.notifications],
                    unreadCount: s.unreadCount + 1,
                }));
            }
        } catch (error) {
            console.error('Failed to add notification:', error);
        }
    },

    subscribe: (userId) => {
        // Clean up existing subscription
        const existing = get()._channel;
        if (existing) {
            supabase.removeChannel(existing);
        }

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotif = payload.new;
                    set((s) => ({
                        notifications: [newNotif, ...s.notifications],
                        unreadCount: s.unreadCount + 1,
                    }));
                }
            )
            .subscribe();

        set({ _channel: channel });
    },
}));
