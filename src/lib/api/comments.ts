import { supabase } from '@/lib/supabase';

export async function getComments(postId: string) {
    const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id(handle, display_name, avatar_url, total_aura)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
}

export async function addComment(postId: string, userId: string, content: string, parentId?: string) {
    const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: userId, content, parent_id: parentId || null })
        .select('*, profiles:user_id(handle, display_name, avatar_url)')
        .single();
    if (error) throw error;
    return data;
}

export async function deleteComment(commentId: string) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw error;
}
