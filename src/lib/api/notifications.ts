import { supabase } from '@/lib/supabase';

export async function getNotifications(userId: string, limit = 30) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data;
}

export async function getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error) throw error;
    return count || 0;
}

export async function markNotificationRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    if (error) throw error;
}

export async function markAllRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error) throw error;
}

export async function createNotification(notification: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    emoji?: string;
    aura_impact?: number;
    action_url?: string;
}) {
    const { error } = await supabase
        .from('notifications')
        .insert(notification);
    if (error) throw error;
}

export function subscribeToNotifications(userId: string, callback: (notification: unknown) => void) {
    return supabase
        .channel(`notifications:${userId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
        }, (payload) => callback(payload.new))
        .subscribe();
}
