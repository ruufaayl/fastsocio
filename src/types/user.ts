/** All user-related type definitions for FASTSOCIO */

import type { DEPARTMENTS, SEMESTERS } from '@/lib/design-system';

export type Department = (typeof DEPARTMENTS)[number];
export type Semester = (typeof SEMESTERS)[number];

/** The 4 aura stat dimensions */
export interface AuraStats {
    social: number;   // 💜 Swipes, connections, DM quality
    content: number;  // 🔥 Posts, reactions, virality
    campus: number;   // 📍 Physical presence, check-ins, events
    wisdom: number;   // 🧠 Study SOS answers, helpful comments
}

/** Aura archetype auto-assigned by dominant stat */
export type AuraArchetype =
    | 'socialite'
    | 'creator'
    | 'campusGhost'
    | 'oracle'
    | 'balanced'
    | 'legend';

/** Aura level name determined by total score */
export type AuraLevelName =
    | 'Shadow'
    | 'Whisper'
    | 'Signal'
    | 'Static'
    | 'Flame'
    | 'Aura'
    | 'GOAT Contender'
    | 'Campus Legend';

export interface AuraLevel {
    name: AuraLevelName;
    icon: string;
    color: string;
    perks: string[];
}

/** Vibe tag IDs */
export type VibeTagId =
    | 'gamer'
    | 'nerd'
    | 'musicHead'
    | 'foodie'
    | 'athlete'
    | 'artist'
    | 'entrepreneur'
    | 'memer';

/** Connection tiers between two users */
export type ConnectionTier =
    | 'spark'       // Just matched, icebreaker pending
    | 'connected'   // Icebreaker done, DM open
    | 'familiar'    // 50+ messages exchanged
    | 'closeCircle' // 200+ messages + mutual Super Aura
    | 'innerCircle'; // Manually elevated, max 5 per user

/** A connection between two users */
export interface Connection {
    id: string;
    userId: string;
    connectedUserId: string;
    tier: ConnectionTier;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount: number;
    icebreakerAnswered: boolean;
    icebreakerQuestion: string;
    createdAt: Date;
}

/** User profile model */
export interface User {
    id: string;
    email: string;
    handle: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    coverUrl?: string;
    department: Department;
    semester: Semester;
    pronouns?: string;
    vibeTags: VibeTagId[];
    auraStats: AuraStats;
    totalAura: number;
    archetype: AuraArchetype;
    level: AuraLevel;
    rank: number;
    auraChange24h: number; // +/- in last 24 hours
    auraHistory: number[]; // last 30 days of total aura for sparkline
    badges: Badge[];
    connections: number;
    followers: number;
    following: number;
    posts: number;
    innerCircle: string[]; // user IDs, max 5
    territories: string[]; // location names they rule
    isPro: boolean;
    proTier?: 'basic' | 'elite';
    isAnonymous: boolean;
    isDormant: boolean;
    streakDays: number;
    lastActive: Date;
    joinedAt: Date;
    currentLocation?: string;
    isVerified: boolean;
}

/** Badge model */
export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    earnedAt?: Date;
    isLocked: boolean;
}

/** User profile as displayed on swipe cards */
export interface SwipeProfile {
    user: User;
    mutualConnections: number;
    recentPosts: string[]; // 3 recent post snippets
    compatibility: number; // 0–100
}
