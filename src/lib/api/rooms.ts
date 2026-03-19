import { supabase } from '@/lib/supabase';

export async function getRooms() {
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('last_activity_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getRoom(roomId: string) {
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
    if (error) throw error;
    return data;
}

export async function getRoomMembers(roomId: string) {
    const { data, error } = await supabase
        .from('room_members')
        .select('*, profiles:user_id(id, handle, display_name, avatar_url, total_aura)')
        .eq('room_id', roomId)
        .order('room_aura', { ascending: false });
    if (error) throw error;
    return data;
}

export async function isRoomMember(roomId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('room_members')
        .select('user_id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();
    return !!data;
}

export async function joinRoom(roomId: string, userId: string) {
    const { error } = await supabase
        .from('room_members')
        .insert({ room_id: roomId, user_id: userId });
    if (error) throw error;
}

export async function leaveRoom(roomId: string, userId: string) {
    const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
    if (error) throw error;
}

export async function getRoomMessages(roomId: string, layer: string = 'discussion', limit = 50) {
    let query = supabase
        .from('room_messages')
        .select('*, profiles:user_id(handle, display_name, avatar_url)')
        .eq('room_id', roomId)
        .eq('layer', layer)
        .order('created_at', { ascending: true })
        .limit(limit);

    // Filter expired lounge messages
    if (layer === 'lounge') {
        query = query.gt('expires_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function sendRoomMessage(roomId: string, userId: string, content: string, layer: string = 'discussion') {
    const expiresAt = layer === 'lounge'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null;

    const { data, error } = await supabase
        .from('room_messages')
        .insert({ room_id: roomId, user_id: userId, content, layer, expires_at: expiresAt })
        .select('*, profiles:user_id(handle, display_name, avatar_url)')
        .single();
    if (error) throw error;

    // Update room last activity
    await supabase.from('rooms').update({ last_activity_at: new Date().toISOString() }).eq('id', roomId);

    return data;
}

export async function createRoom(room: {
    name: string;
    description?: string;
    type: string;
    icon?: string;
    tags?: string[];
    created_by: string;
    has_passcode?: boolean;
    passcode_hash?: string;
}) {
    const { data, error } = await supabase
        .from('rooms')
        .insert(room)
        .select()
        .single();
    if (error) throw error;

    // Auto-join creator as admin
    await supabase.from('room_members').insert({
        room_id: data.id,
        user_id: room.created_by,
        role: 'admin',
    });

    return data;
}

export function subscribeToRoomMessages(roomId: string, callback: (message: unknown) => void) {
    return supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'room_messages',
            filter: `room_id=eq.${roomId}`,
        }, (payload) => callback(payload.new))
        .subscribe();
}
