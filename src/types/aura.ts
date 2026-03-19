/** All aura economy and gamification type definitions */

/** Aura transaction — every aura change is logged */
export interface AuraTransaction {
    id: string;
    userId: string;
    amount: number; // positive = earned, negative = spent/lost
    category: 'social' | 'content' | 'campus' | 'wisdom';
    reason: string;
    source: string; // what triggered this (post ID, quest ID, etc.)
    createdAt: Date;
}

/** Aura multiplier event (random 2-hour windows) */
export interface AuraEvent {
    id: string;
    title: string;
    description: string;
    multiplier: number;
    category: 'social' | 'content' | 'campus' | 'wisdom' | 'all';
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
    icon: string;
}

/** Aura multiplier config */
export interface AuraMultiplier {
    category: string;
    multiplier: number;
    expiresAt: Date;
}

/** Aura duel between two students */
export interface AuraDuel {
    id: string;
    challengerId: string;
    challengerName: string;
    challengerAvatar: string;
    targetId: string;
    targetName: string;
    targetAvatar: string;
    type: 'postDuel' | 'swipeDuel' | 'questDuel' | 'reactionDuel';
    stake: number; // aura in escrow per person
    status: 'pending' | 'active' | 'completed' | 'declined';
    winnerId?: string;
    challengerScore: number;
    targetScore: number;
    spectators: number;
    bets: DuelBet[];
    startsAt?: Date;
    endsAt?: Date;
    createdAt: Date;
}

/** Spectator bet on a duel */
export interface DuelBet {
    userId: string;
    userName: string;
    amount: number;
    backedUserId: string;
}

/** Quest types */
export type QuestType = 'daily' | 'weekly' | 'semester' | 'secret';

/** Quest difficulty */
export type QuestDifficulty = 'easy' | 'medium' | 'hard';

/** Quest model */
export interface Quest {
    id: string;
    type: QuestType;
    difficulty: QuestDifficulty;
    title: string;
    description: string;
    icon: string;
    reward: number; // aura reward
    progress: number; // current progress
    target: number;  // target to complete
    isCompleted: boolean;
    isClaimed: boolean;
    isSecret: boolean;
    expiresAt?: Date;
    category: 'social' | 'content' | 'campus' | 'wisdom';
}

/** Daily streak data */
export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastClaimDate: Date;
    nextReward: number;
    nextMilestone: number;
}

/** Shop item categories */
export type ShopCategory = 'frames' | 'themes' | 'functional' | 'seasonal';

/** Shop item */
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    category: ShopCategory;
    price: number; // in aura
    imageUrl?: string;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    isOwned: boolean;
    isLimited: boolean;
    expiresAt?: Date;
}

/** Notification types */
export type NotificationType =
    | 'auraGain'
    | 'auraLoss'
    | 'levelUp'
    | 'levelDown'
    | 'rankChange'
    | 'newConnection'
    | 'connectionCold'
    | 'superAura'
    | 'anonymousCrush'
    | 'crushClue'
    | 'postTrending'
    | 'reactionMilestone'
    | 'quotePost'
    | 'auraTip'
    | 'comment'
    | 'challenge'
    | 'auraEvent'
    | 'questRefresh'
    | 'campusPulse'
    | 'eventReminder'
    | 'territoryThreat'
    | 'weeklyRecap'
    | 'semesterSummary'
    | 'rivalActivity';

/** Notification model */
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    emoji: string;
    auraImpact?: number;
    actionUrl: string;
    isRead: boolean;
    createdAt: Date;
}

/** Leaderboard category */
export type LeaderboardCategory =
    | 'overall'
    | 'social'
    | 'content'
    | 'campus'
    | 'wisdom'
    | 'celebrityCrush'
    | 'mostViral'
    | 'campusGhost'
    | 'grinder'
    | 'comebackKid'
    | 'controversial'
    | 'oracle'
    | 'socialButterfly'
    | 'biggestFall'
    | 'silentKiller';

/** Leaderboard entry */
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    userAvatar: string;
    userHandle: string;
    userDepartment: string;
    score: number;
    change24h: number;
    changePercent: number;
    sparkline: number[];
    archetype: string;
    level: string;
}

/** Campus map hotspot */
export interface CampusHotspot {
    id: string;
    name: string;
    zone: string;
    x: number; // position on map (0–100%)
    y: number;
    type: 'building' | 'ground' | 'cafeteria' | 'library' | 'parking' | 'gate' | 'admin';
    crowdLevel: 'empty' | 'light' | 'moderate' | 'packed';
    rating: number; // 1–5
    vibeRating: number;
    ruler?: string; // user name who "rules" this location
    rulerAvatar?: string;
    checkInCount: number;
    activeEvents: number;
    recentReview?: string;
}
