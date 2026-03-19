'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { LeaderboardCategory } from '@/types/aura';

interface LeaderboardState {
    rankings: any[];
    departmentRankings: any[];
    category: LeaderboardCategory;
    isLoading: boolean;
    loadLeaderboard: (category?: LeaderboardCategory) => Promise<void>;
    loadDepartmentRankings: () => Promise<void>;
    setCategory: (cat: LeaderboardCategory) => void;
}

function getOrderColumn(category: LeaderboardCategory): string {
    switch (category) {
        case 'social':
        case 'socialButterfly':
            return 'aura_social';
        case 'content':
        case 'mostViral':
            return 'aura_content';
        case 'campus':
        case 'campusGhost':
            return 'aura_campus';
        case 'wisdom':
        case 'oracle':
            return 'aura_wisdom';
        default:
            return 'total_aura';
    }
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
    rankings: [],
    departmentRankings: [],
    category: 'overall',
    isLoading: false,

    loadLeaderboard: async (category?) => {
        const cat = category ?? get().category;
        try {
            set({ isLoading: true });
            const orderCol = getOrderColumn(cat);

            const { data, error } = await supabase
                .from('profiles')
                .select('id, display_name, handle, avatar_url, department_id, total_aura, aura_social, aura_content, aura_campus, aura_wisdom, archetype, departments(name)')
                .order(orderCol, { ascending: false })
                .limit(100);

            if (error) throw error;

            const rankings = (data || []).map((profile: any, index: number) => ({
                rank: index + 1,
                userId: profile.id,
                userName: profile.display_name,
                userAvatar: profile.avatar_url,
                userHandle: profile.handle,
                userDepartment: profile.departments?.name ?? '',
                score: profile[orderCol] ?? profile.total_aura ?? 0,
                change24h: 0,
                changePercent: 0,
                sparkline: [],
                archetype: profile.archetype ?? '',
                level: '',
            }));

            set({ rankings, isLoading: false });
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            set({ isLoading: false });
        }
    },

    loadDepartmentRankings: async () => {
        try {
            set({ isLoading: true });

            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('total_aura', { ascending: false });

            if (error) throw error;
            set({ departmentRankings: data || [], isLoading: false });
        } catch (error) {
            console.error('Failed to load department rankings:', error);
            set({ isLoading: false });
        }
    },

    setCategory: (cat) => {
        set({ category: cat });
        get().loadLeaderboard(cat);
    },
}));
