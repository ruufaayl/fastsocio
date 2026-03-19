import { supabase } from '@/lib/supabase';
import type { FeedRow } from '@/types/database';

export async function getFeed(userId: string, limit = 20, offset = 0): Promise<FeedRow[]> {
    const { data, error } = await supabase.rpc('get_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
    });
    if (error) throw error;
    return (data || []) as FeedRow[];
}

export async function getPostsByUser(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
}

export async function createPost(post: {
    type: string;
    user_id: string | null;
    content: string;
    image_url?: string;
    is_anonymous?: boolean;
    poll_data?: unknown;
    hot_take_data?: unknown;
    event_data?: unknown;
    challenge_data?: unknown;
    campus_review_data?: unknown;
    study_sos_data?: unknown;
    expires_at?: string;
}) {
    const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deletePost(postId: string) {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
}

export async function uploadPostImage(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from('post-images')
        .upload(path, file);
    if (error) throw error;

    const { data } = supabase.storage.from('post-images').getPublicUrl(path);
    return data.publicUrl;
}
