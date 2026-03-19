'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isOnboarding: boolean;
    loadSession: () => Promise<void>;
    setUser: (user: any | null) => void;
    setLoading: (loading: boolean) => void;
    setOnboarding: (v: boolean) => void;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Record<string, any>) => Promise<void>;
}

async function fetchProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, departments(*), degrees(*)')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isOnboarding: false,

    loadSession: async () => {
        try {
            set({ isLoading: true });
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                set({ user: profile, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load session:', error);
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (loading) => set({ isLoading: loading }),
    setOnboarding: (v) => set({ isOnboarding: v }),

    login: async (email, password) => {
        try {
            set({ isLoading: true });
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.user) {
                const profile = await fetchProfile(data.user.id);
                set({ user: profile, isAuthenticated: true, isLoading: false });
            }
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await supabase.auth.signOut();
            set({ user: null, isAuthenticated: false });
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    },

    updateProfile: async (updates) => {
        try {
            const user = get().user;
            if (!user) return;
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);
            if (error) throw error;
            set({ user: { ...user, ...updates } });
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    },
}));
