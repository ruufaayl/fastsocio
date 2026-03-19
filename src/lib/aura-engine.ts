/** Aura engine — all aura calculation logic for FASTSOCIO */

import type { AuraStats, AuraArchetype, AuraLevel } from '@/types/user';
import { AURA_LEVELS, AURA_ARCHETYPES } from '@/lib/design-system';

// ── Aura Earn/Spend Constants ──

export const AURA_REWARDS = {
    // Social Aura
    rightSwipe: 5,
    matchConnection: 25,
    icebreaker: 10,
    superAuraSent: -20,
    superAuraReceived: 30,
    connectionUpgrade: 15,
    innerCircleAdd: 50,

    // Content Aura
    postCreated: 10,
    reactionReceived: 2,
    comment: 3,
    postTrending: 50,
    quotedPost: 15,
    auraTipReceived: 0, // variable
    viralPost100: 100,

    // Campus Aura
    checkIn: 10,
    eventRSVP: 15,
    eventAttend: 30,
    territoryDaily: 5,
    campusReviewPost: 15,

    // Wisdom Aura
    studySOSAnswer: 20,
    markedHelpful: 50,
    resourceDrop: 15,
    resourceDownloaded20: 30,
    roomQualityPost: 10,

    // Quest rewards
    questEasy: 10,
    questMedium: 25,
    questHard: 50,
    questWeekly: 100,
    questSemester: 300,

    // Special
    appreciation: 20,
    challengeComplete: 30,
    duelWin: 200,
    duelLoss: -200,
    streakDay1: 10,
    streakDay3: 30,
    streakDay7: 100,
    streakDay14: 200,
    streakDay30: 500,
    streakDay100: 1000,
    crushReveal: 300,
    legacyReceived: 0, // 10% of senior's total

    // Costs
    ghostModeCost: -200,
    auraShieldCost: -300,
    clueSkipCost: -100,
    postBoostCost: -200,
    incognitoCost: -250,
} as const;

// ── Decay Rules ──

export const DECAY_RULES = {
    graceDays: 1,
    mildDecayDays: 2, // starts at day 2
    mildDecayAmount: 5,
    moderateDecayDays: 5,
    moderateDecayAmount: 15,
    dormantDays: 7,
    ghostDays: 14,
} as const;

/** Get the aura level for a given total aura score */
export function getAuraLevel(score: number): AuraLevel {
    const level = AURA_LEVELS.find(l => score >= l.min && score <= l.max);
    if (!level) return { name: 'Shadow', icon: '🌑', color: '#555555', perks: [] };
    return {
        name: level.name as AuraLevel['name'],
        icon: level.icon,
        color: level.color,
        perks: [...level.perks],
    };
}

/** Determine the archetype based on the 4 aura stats */
export function getAuraArchetype(stats: AuraStats): AuraArchetype {
    const { social, content, campus, wisdom } = stats;
    const total = social + content + campus + wisdom;

    // Check for Legend first (all stats above 5000)
    if (social >= 5000 && content >= 5000 && campus >= 5000 && wisdom >= 5000) {
        return 'legend';
    }

    // Check for Balanced (no stat more than 1.5x any other)
    const vals = [social, content, campus, wisdom].filter(v => v > 0);
    if (vals.length >= 4) {
        const maxVal = Math.max(...vals);
        const minVal = Math.min(...vals);
        if (maxVal <= minVal * 1.5 && total > 200) {
            return 'balanced';
        }
    }

    // Find dominant stat
    const stats_map: [AuraArchetype, number][] = [
        ['socialite', social],
        ['creator', content],
        ['campusGhost', campus],
        ['oracle', wisdom],
    ];
    stats_map.sort((a, b) => b[1] - a[1]);
    return stats_map[0][0];
}

/** Calculate daily decay amount based on days inactive */
export function calculateDecay(daysInactive: number): number {
    if (daysInactive <= DECAY_RULES.graceDays) return 0;
    if (daysInactive <= DECAY_RULES.mildDecayDays) return DECAY_RULES.mildDecayAmount;
    if (daysInactive <= DECAY_RULES.moderateDecayDays) return DECAY_RULES.moderateDecayAmount;
    return DECAY_RULES.moderateDecayAmount; // stays at 15/day for 5+ days
}

/** Get CSS color for an aura score */
export function getAuraColor(score: number): string {
    return getAuraLevel(score).color;
}

/** Get the streak reward for a given streak day */
export function getStreakReward(day: number): number {
    if (day >= 100) return AURA_REWARDS.streakDay100;
    if (day >= 30) return AURA_REWARDS.streakDay30;
    if (day >= 14) return AURA_REWARDS.streakDay14;
    if (day >= 7) return AURA_REWARDS.streakDay7;
    if (day >= 3) return AURA_REWARDS.streakDay3;
    return AURA_REWARDS.streakDay1;
}

/** Get archetype display info */
export function getArchetypeInfo(archetype: AuraArchetype) {
    return AURA_ARCHETYPES[archetype];
}

/** Calculate total aura from stats */
export function calculateTotalAura(stats: AuraStats): number {
    return stats.social + stats.content + stats.campus + stats.wisdom;
}
