'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type SwipeMode = 'vibeMatch' | 'randomChaos' | 'department' | 'rival' | 'timeMachine' | 'ghost';

interface DiscoverState {
    swipeStack: any[];
    currentIndex: number;
    swipedRight: string[];
    swipedLeft: string[];
    matches: any[];
    currentMode: SwipeMode;
    superAurasRemaining: number;
    pendingMatch: any | null;
    isLoading: boolean;
    loadDeck: (userId: string, mode: SwipeMode, departmentId?: string) => Promise<void>;
    swipeRight: (swiperId: string, swipedId: string) => Promise<boolean>;
    swipeLeft: (swiperId: string, swipedId: string) => Promise<void>;
    superAura: (swiperId: string, swipedId: string) => Promise<boolean>;
    setMode: (mode: SwipeMode) => void;
    resetDeck: () => void;
    clearPendingMatch: () => void;
}

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
    swipeStack: [],
    currentIndex: 0,
    swipedRight: [],
    swipedLeft: [],
    matches: [],
    currentMode: 'vibeMatch',
    superAurasRemaining: 3,
    pendingMatch: null,
    isLoading: false,

    loadDeck: async (userId, mode, departmentId?) => {
        try {
            set({ isLoading: true });

            // Get already-swiped user IDs to exclude them
            const { data: swipedData } = await supabase
                .from('swipes')
                .select('swiped_id')
                .eq('swiper_id', userId);

            const swipedIds = (swipedData || []).map((s: any) => s.swiped_id);
            const excludeIds = [userId, ...swipedIds];

            let query = supabase
                .from('profiles')
                .select('*, departments(*), degrees(*)')
                .not('id', 'in', `(${excludeIds.join(',')})`)
                .limit(50);

            if (mode === 'department' && departmentId) {
                query = query.eq('department_id', departmentId);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Shuffle the deck
            const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);

            set({
                swipeStack: shuffled,
                currentIndex: 0,
                isLoading: false,
            });
        } catch (error) {
            console.error('Failed to load deck:', error);
            set({ isLoading: false });
        }
    },

    swipeRight: async (swiperId, swipedId) => {
        try {
            // Insert swipe record
            await supabase
                .from('swipes')
                .insert({ swiper_id: swiperId, swiped_id: swipedId, direction: 'right' });

            // Advance card
            set((s) => ({
                swipedRight: [...s.swipedRight, swipedId],
                currentIndex: s.currentIndex + 1,
            }));

            // Check if mutual like exists (DB trigger creates match on mutual like)
            const { data: match } = await supabase
                .from('matches')
                .select('*, matched_profile:profiles!matches_user2_id_fkey(*)')
                .or(`and(user1_id.eq.${swiperId},user2_id.eq.${swipedId}),and(user1_id.eq.${swipedId},user2_id.eq.${swiperId})`)
                .maybeSingle();

            if (match) {
                set((s) => ({
                    matches: [...s.matches, match],
                    pendingMatch: match,
                }));
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to swipe right:', error);
            return false;
        }
    },

    swipeLeft: async (swiperId, swipedId) => {
        try {
            await supabase
                .from('swipes')
                .insert({ swiper_id: swiperId, swiped_id: swipedId, direction: 'left' });

            set((s) => ({
                swipedLeft: [...s.swipedLeft, swipedId],
                currentIndex: s.currentIndex + 1,
            }));
        } catch (error) {
            console.error('Failed to swipe left:', error);
        }
    },

    superAura: async (swiperId, swipedId) => {
        const state = get();
        if (state.superAurasRemaining <= 0) return false;

        try {
            await supabase
                .from('swipes')
                .insert({ swiper_id: swiperId, swiped_id: swipedId, direction: 'super' });

            set((s) => ({
                swipedRight: [...s.swipedRight, swipedId],
                currentIndex: s.currentIndex + 1,
                superAurasRemaining: s.superAurasRemaining - 1,
            }));

            // Check for match (DB trigger creates match on mutual like)
            const { data: match } = await supabase
                .from('matches')
                .select('*, matched_profile:profiles!matches_user2_id_fkey(*)')
                .or(`and(user1_id.eq.${swiperId},user2_id.eq.${swipedId}),and(user1_id.eq.${swipedId},user2_id.eq.${swiperId})`)
                .maybeSingle();

            if (match) {
                set((s) => ({
                    matches: [...s.matches, match],
                    pendingMatch: match,
                }));
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to super aura:', error);
            return false;
        }
    },

    setMode: (mode) => {
        set({ currentMode: mode });
    },

    resetDeck: () => {
        set({
            swipeStack: [],
            currentIndex: 0,
            swipedRight: [],
            swipedLeft: [],
        });
    },

    clearPendingMatch: () => set({ pendingMatch: null }),
}));
