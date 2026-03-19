'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { AuraStats, AuraLevel, AuraArchetype } from '@/types/user';
import type { AuraTransaction } from '@/types/aura';
import { getAuraLevel, getAuraArchetype, calculateTotalAura } from '@/lib/aura-engine';

interface AuraState {
    totalAura: number;
    stats: AuraStats;
    level: AuraLevel;
    archetype: AuraArchetype;
    transactions: AuraTransaction[];
    multiplier: number;
    /** Initialize aura state from a profile object */
    loadFromProfile: (profile: any) => void;
    /** Add aura to a specific stat via supabase RPC. Returns effective amount. */
    addAura: (userId: string, amount: number, category: keyof AuraStats, reason: string) => Promise<number>;
    /** Spend aura via supabase RPC. Returns false if insufficient. */
    spendAura: (userId: string, amount: number, reason: string) => Promise<boolean>;
    setMultiplier: (m: number) => void;
}

const defaultStats: AuraStats = { social: 0, content: 0, campus: 0, wisdom: 0 };
const defaultLevel: AuraLevel = { name: 'Shadow', icon: '', color: '#555555', perks: [] };

export const useAuraStore = create<AuraState>((set, get) => ({
    totalAura: 0,
    stats: defaultStats,
    level: defaultLevel,
    archetype: 'balanced',
    transactions: [],
    multiplier: 1,

    loadFromProfile: (profile) => {
        if (!profile) return;
        const stats: AuraStats = {
            social: profile.aura_social ?? profile.auraStats?.social ?? 0,
            content: profile.aura_content ?? profile.auraStats?.content ?? 0,
            campus: profile.aura_campus ?? profile.auraStats?.campus ?? 0,
            wisdom: profile.aura_wisdom ?? profile.auraStats?.wisdom ?? 0,
        };
        const total = profile.total_aura ?? profile.totalAura ?? calculateTotalAura(stats);
        set({
            stats,
            totalAura: total,
            level: getAuraLevel(total),
            archetype: getAuraArchetype(stats),
            multiplier: profile.aura_multiplier ?? 1,
        });
    },

    addAura: async (userId, amount, category, reason) => {
        const effectiveAmount = Math.round(amount * get().multiplier);

        // Optimistic local update
        set((s) => {
            const newStats = { ...s.stats, [category]: s.stats[category] + effectiveAmount };
            const newTotal = calculateTotalAura(newStats);
            return {
                stats: newStats,
                totalAura: newTotal,
                level: getAuraLevel(newTotal),
                archetype: getAuraArchetype(newStats),
                transactions: [
                    {
                        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        userId,
                        amount: effectiveAmount,
                        category,
                        reason,
                        source: '',
                        createdAt: new Date(),
                    },
                    ...s.transactions.slice(0, 99),
                ],
            };
        });

        try {
            await supabase.rpc('add_aura', {
                p_user_id: userId,
                p_amount: effectiveAmount,
                p_category: category,
                p_reason: reason,
            });
        } catch (error) {
            console.error('Failed to add aura:', error);
        }

        return effectiveAmount;
    },

    spendAura: async (userId, amount, reason) => {
        const state = get();
        if (state.totalAura < amount) return false;

        // Optimistic local update - deduct proportionally
        set((s) => {
            const ratio = amount / s.totalAura;
            const newStats: AuraStats = {
                social: Math.max(0, Math.round(s.stats.social - s.stats.social * ratio)),
                content: Math.max(0, Math.round(s.stats.content - s.stats.content * ratio)),
                campus: Math.max(0, Math.round(s.stats.campus - s.stats.campus * ratio)),
                wisdom: Math.max(0, Math.round(s.stats.wisdom - s.stats.wisdom * ratio)),
            };
            const newTotal = calculateTotalAura(newStats);
            return {
                stats: newStats,
                totalAura: newTotal,
                level: getAuraLevel(newTotal),
                archetype: getAuraArchetype(newStats),
                transactions: [
                    {
                        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        userId,
                        amount: -amount,
                        category: 'social',
                        reason,
                        source: '',
                        createdAt: new Date(),
                    },
                    ...s.transactions.slice(0, 99),
                ],
            };
        });

        try {
            await supabase.rpc('add_aura', {
                p_user_id: userId,
                p_amount: -amount,
                p_category: 'social',
                p_reason: reason,
            });
        } catch (error) {
            console.error('Failed to spend aura:', error);
        }

        return true;
    },

    setMultiplier: (m) => set({ multiplier: m }),
}));
