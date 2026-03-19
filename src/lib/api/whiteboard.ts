import { supabase } from '@/lib/supabase';

export async function getWhiteboardPosts(filter: 'today' | 'hour' | 'trending' = 'today') {
    let query = supabase
        .from('whiteboard_posts')
        .select('*, profiles:user_id(handle, display_name, avatar_url)')
        .gt('expires_at', new Date().toISOString());

    if (filter === 'hour') {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', oneHourAgo);
    }

    if (filter === 'trending') {
        query = query.order('heart_count', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data;
}

export async function createWhiteboardPost(post: {
    user_id: string;
    media_url: string;
    media_type: 'image' | 'video';
    caption?: string;
    pin_color?: string;
}) {
    const { data, error } = await supabase
        .from('whiteboard_posts')
        .insert(post)
        .select('*, profiles:user_id(handle, display_name, avatar_url)')
        .single();
    if (error) throw error;
    return data;
}

export async function heartWhiteboardPost(userId: string, postId: string) {
    const { data: existing } = await supabase
        .from('whiteboard_hearts')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

    if (existing) {
        await supabase.from('whiteboard_hearts').delete().eq('user_id', userId).eq('post_id', postId);
        return false; // unhearted
    } else {
        await supabase.from('whiteboard_hearts').insert({ user_id: userId, post_id: postId });
        return true; // hearted
    }
}

export async function getUserHearts(userId: string, postIds: string[]) {
    if (postIds.length === 0) return new Set<string>();
    const { data } = await supabase
        .from('whiteboard_hearts')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);
    return new Set(data?.map(h => h.post_id) || []);
}

export async function uploadWhiteboardMedia(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from('whiteboard')
        .upload(path, file);
    if (error) throw error;

    const { data } = supabase.storage.from('whiteboard').getPublicUrl(path);
    return data.publicUrl;
}

export function subscribeToWhiteboard(callback: (post: unknown) => void) {
    return supabase
        .channel('whiteboard')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'whiteboard_posts',
        }, (payload) => callback(payload.new))
        .subscribe();
}
