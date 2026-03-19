/** Room and society type definitions */

/** Room types */
export type RoomType = 'official' | 'community' | 'secret' | 'temporal';

/** Room sub-layer */
export type RoomLayer = 'announcements' | 'discussion' | 'lounge';

/** Room member role */
export type RoomMemberRole = 'admin' | 'moderator' | 'member';

/** Room member */
export interface RoomMember {
    userId: string;
    userName: string;
    userAvatar: string;
    role: RoomMemberRole;
    roomAura: number;
    joinedAt: Date;
}

/** Room message */
export interface RoomMessage {
    id: string;
    roomId: string;
    layer: RoomLayer;
    userId: string;
    userName: string;
    userAvatar: string;
    userHandle: string;
    content: string;
    imageUrl?: string;
    isPinned: boolean;
    reactions: { [key: string]: number };
    createdAt: Date;
    expiresAt?: Date; // for lounge messages (24hr)
}

/** Room model */
export interface Room {
    id: string;
    name: string;
    description: string;
    type: RoomType;
    icon: string;
    coverUrl?: string;
    memberCount: number;
    members: RoomMember[];
    messages: RoomMessage[];
    isVerified: boolean;
    isPopular: boolean;
    isFeatured: boolean;
    hasPasscode: boolean;
    tags: string[];
    createdBy: string;
    createdAt: Date;
    lastActivityAt: Date;
    // Room-specific leaderboard top 3
    topContributors: { userId: string; userName: string; userAvatar: string; roomAura: number }[];
}

/** Society model — extends Room with additional fields */
export interface Society {
    id: string;
    name: string;
    shortName: string;
    description: string;
    logoUrl: string;
    coverUrl: string;
    isVerified: boolean;
    memberCount: number;
    collectiveAura: number;
    president: string;
    presidentId: string;
    events: SocietyEvent[];
    achievements: SocietyAchievement[];
    roomId: string; // linked room
    joinStatus: 'open' | 'applicationRequired' | 'inviteOnly';
}

/** Society event */
export interface SocietyEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    dateTime: Date;
    rsvpCount: number;
    maxCapacity?: number;
    isActive: boolean;
}

/** Society achievement */
export interface SocietyAchievement {
    id: string;
    title: string;
    icon: string;
    earnedAt: Date;
}

/** Confession (special room post type) */
export interface Confession {
    id: string;
    content: string;
    reactions: { fire: number; seen: number; aura: number; dead: number; respect: number; cold: number };
    isIconic: boolean; // 200+ fire reactions
    createdAt: Date;
    expiresAt: Date; // 48hr
    randomAvatar: string;
    anonymousName: string;
}
