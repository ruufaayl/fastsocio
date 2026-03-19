/** All post-related type definitions for FASTSOCIO */

/** The 15 post types supported in FASTSOCIO */
export type PostType =
    | 'thread'           // Text post, 500 chars
    | 'visualDrop'       // Image/video with caption
    | 'hotTake'          // Anonymous opinion with agree/disagree vote
    | 'poll'             // 2-4 options, 24hr
    | 'confession'       // Fully anonymous
    | 'auraFlex'         // Auto-generated aura milestone
    | 'studySOS'         // Course help request
    | 'studySOSAnswer'   // Response to SOS
    | 'eventDrop'        // Micro-event with RSVP
    | 'rant'             // 280 chars, 6hr expiry
    | 'challenge'        // Tag someone to do something
    | 'appreciation'     // Tag someone nicely, +20 aura
    | 'campusReview'     // Rate campus location
    | 'collabRequest'    // Looking for project partner
    | 'prediction';      // Campus votes on prediction

/** Available reaction types */
export type ReactionType = 'fire' | 'seen' | 'aura' | 'dead' | 'respect' | 'cold';

/** Reaction counts on a post */
export interface ReactionCounts {
    fire: number;
    seen: number;
    aura: number;
    dead: number;
    respect: number;
    cold: number;
}

/** Individual reaction by a user */
export interface Reaction {
    id: string;
    userId: string;
    postId: string;
    type: ReactionType;
    createdAt: Date;
}

/** Poll option within a poll post */
export interface PollOption {
    id: string;
    text: string;
    votes: number;
    percentage: number;
}

/** Comment on a post */
export interface Comment {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userHandle: string;
    content: string;
    reactions: ReactionCounts;
    replies: Comment[];
    createdAt: Date;
}

/** Hot take voting data */
export interface HotTakeData {
    agreePercentage: number;
    disagreePercentage: number;
    totalVotes: number;
    status: 'active' | 'campusConsensus' | 'coldTake' | 'hotTakeOfWeek';
}

/** Event data for eventDrop posts */
export interface EventData {
    title: string;
    location: string;
    dateTime: Date;
    rsvpCount: number;
    maxCapacity?: number;
}

/** Challenge data */
export interface ChallengeData {
    targetUserId: string;
    targetUserName: string;
    challenge: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed';
}

/** Campus review data */
export interface CampusReviewData {
    locationName: string;
    foodRating?: number;
    vibeRating?: number;
    crowdLevel: 'empty' | 'light' | 'moderate' | 'packed';
    chaosLevel?: number;
}

/** Study SOS data */
export interface StudySOSData {
    courseCode: string;
    urgency: 'chill' | 'kindaUrgent' | 'dueTomorrow';
    isSolved: boolean;
    answerCount: number;
}

/** The complete post model */
export interface Post {
    id: string;
    type: PostType;
    userId: string;
    userName: string;
    userAvatar: string;
    userHandle: string;
    userArchetype: string;
    userAuraLevel: string;
    userDepartment: string;
    content: string;
    imageUrl?: string;
    reactions: ReactionCounts;
    commentCount: number;
    comments: Comment[];
    bookmarkCount: number;
    shareCount: number;
    vibeScore: number; // 0–100 aggregated from vibe checks
    auraTips: number;  // total aura tipped
    isAnonymous: boolean;
    expiresAt?: Date;
    createdAt: Date;
    // Type-specific data
    pollOptions?: PollOption[];
    hotTakeData?: HotTakeData;
    eventData?: EventData;
    challengeData?: ChallengeData;
    campusReviewData?: CampusReviewData;
    studySOSData?: StudySOSData;
}

/** Feed layer/tab type */
export type FeedLayer = 'forYou' | 'campusLive' | 'circle';
