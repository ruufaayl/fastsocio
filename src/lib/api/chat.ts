import { supabase } from '@/lib/supabase';

export async function getConversations(userId: string) {
    const { data, error } = await supabase
        .from('connections')
        .select(`
            *,
            connected_profile:connected_user_id(id, handle, display_name, avatar_url, total_aura, last_active)
        `)
        .eq('user_id', userId)
        .not('last_message', 'is', null)
        .order('last_message_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getMatchedConnections(userId: string) {
    // Get all connections that came from matches
    const { data, error } = await supabase
        .from('connections')
        .select(`
            *,
            connected_profile:connected_user_id(id, handle, display_name, avatar_url, total_aura, last_active)
        `)
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data;
}

export async function getMessages(userId: string, otherUserId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
}

export async function sendMessage(senderId: string, receiverId: string, content: string, messageType: string = 'text') {
    const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: senderId, receiver_id: receiverId, content, message_type: messageType })
        .select()
        .single();
    if (error) throw error;

    // Update connection last message
    await supabase
        .from('connections')
        .update({
            last_message: content,
            last_message_at: new Date().toISOString(),
            message_count: supabase.rpc ? undefined : 0, // will be handled by increment
        })
        .eq('user_id', senderId)
        .eq('connected_user_id', receiverId);

    // Increment unread for receiver
    await supabase.rpc('increment_unread' as never, { p_user_id: receiverId, p_connected_id: senderId } as never).catch(() => {
        // Fallback: just update
        supabase.from('connections')
            .update({ last_message: content, last_message_at: new Date().toISOString() })
            .eq('user_id', receiverId)
            .eq('connected_user_id', senderId);
    });

    return data;
}

export async function markMessagesRead(userId: string, senderId: string) {
    await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

    // Reset unread count
    await supabase
        .from('connections')
        .update({ unread_count: 0 })
        .eq('user_id', userId)
        .eq('connected_user_id', senderId);
}

export function subscribeToMessages(userId: string, callback: (message: unknown) => void) {
    return supabase
        .channel(`messages:${userId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`,
        }, (payload) => callback(payload.new))
        .subscribe();
}
