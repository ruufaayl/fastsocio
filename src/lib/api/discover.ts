import { supabase } from '@/lib/supabase';
import type { Profile, DbMatch } from '@/types/database';

export type SwipeMode = 'vibeMatch' | 'randomChaos' | 'department' | 'rival' | 'ghost';

export async function getSwipeDeck(userId: string, mode: SwipeMode, departmentId?: string | null): Promise<Profile[]> {
    // Get IDs already swiped
    const { data: swiped } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', userId);

    const swipedIds = swiped?.map(s => s.swiped_id) || [];
    swipedIds.push(userId); // exclude self

    let query = supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${swipedIds.join(',')})`)
        .limit(20);

    if (mode === 'department' && departmentId) {
        query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Shuffle results
    const profiles = data || [];
    for (let i = profiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [profiles[i], profiles[j]] = [profiles[j], profiles[i]];
    }

    return profiles;
}

export async function recordSwipe(swiperId: string, swipedId: string, direction: 'right' | 'left' | 'super') {
    const { error } = await supabase
        .from('swipes')
        .insert({ swiper_id: swiperId, swiped_id: swipedId, direction });
    if (error) throw error;

    // Check if a match was created (by the DB trigger)
    if (direction === 'right' || direction === 'super') {
        const userA = swiperId < swipedId ? swiperId : swipedId;
        const userB = swiperId < swipedId ? swipedId : swiperId;

        const { data: match } = await supabase
            .from('matches')
            .select('*')
            .eq('user_a', userA)
            .eq('user_b', userB)
            .eq('chat_unlocked', true)
            .single();

        if (match) {
            // Fetch the matched user's profile
            const { data: matchedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', swipedId)
                .single();

            return { isMatch: true, match: match as DbMatch, matchedProfile: matchedProfile as Profile };
        }
    }

    return { isMatch: false, match: null, matchedProfile: null };
}

export async function getMatches(userId: string) {
    const { data, error } = await supabase
        .from('matches')
        .select(`
            *,
            profile_a:user_a(id, handle, display_name, avatar_url, total_aura, department_id),
            profile_b:user_b(id, handle, display_name, avatar_url, total_aura, department_id)
        `)
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .eq('chat_unlocked', true)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}
