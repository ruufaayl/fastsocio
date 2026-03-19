import { supabase } from '@/lib/supabase';

export async function reactToPost(userId: string, postId: string, type: string) {
    // Check existing reaction
    const { data: existing } = await supabase
        .from('reactions')
        .select('id, type')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

    if (existing) {
        if (existing.type === type) {
            // Same reaction → remove
            await supabase.from('reactions').delete().eq('id', existing.id);
            return { removed: true, previousType: type };
        } else {
            // Different → update
            const prev = existing.type;
            await supabase.from('reactions').update({ type }).eq('id', existing.id);
            return { removed: false, previousType: prev };
        }
    } else {
        // New reaction
        await supabase.from('reactions').insert({ user_id: userId, post_id: postId, type });
        return { removed: false, previousType: undefined };
    }
}

export async function getUserReaction(userId: string, postId: string) {
    const { data } = await supabase
        .from('reactions')
        .select('type')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();
    return data?.type || null;
}

export async function getUserReactionsForPosts(userId: string, postIds: string[]) {
    if (postIds.length === 0) return {};
    const { data } = await supabase
        .from('reactions')
        .select('post_id, type')
        .eq('user_id', userId)
        .in('post_id', postIds);

    const map: Record<string, string> = {};
    data?.forEach(r => { map[r.post_id] = r.type; });
    return map;
}
