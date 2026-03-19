'use client';
import { useAuraStore } from '@/store/auraStore';
import { getAuraLevel, getAuraArchetype, getArchetypeInfo } from '@/lib/aura-engine';
import type { AuraStats } from '@/types/user';

/** Hook for aura-related calculations and actions */
export function useAura() {
    const { totalAura, stats, addAura, multiplier } = useAuraStore();
    const level = getAuraLevel(totalAura);
    const archetype = getAuraArchetype(stats);
    const archetypeInfo = getArchetypeInfo(archetype);

    return { totalAura, stats, level, archetype, archetypeInfo, multiplier, addAura };
}
