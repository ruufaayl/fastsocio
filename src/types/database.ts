/** Supabase Database types - simplified manual definitions */

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'total_aura' | 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
                Update: Partial<Omit<Profile, 'id' | 'total_aura'>>;
            };
            departments: {
                Row: Department;
                Insert: Omit<Department, 'id' | 'created_at'>;
                Update: Partial<Omit<Department, 'id'>>;
            };
            degrees: {
                Row: Degree;
                Insert: Omit<Degree, 'id' | 'created_at'>;
                Update: Partial<Omit<Degree, 'id'>>;
            };
            posts: {
                Row: DbPost;
                Insert: Omit<DbPost, 'id' | 'created_at' | 'reaction_fire' | 'reaction_seen' | 'reaction_aura' | 'reaction_dead' | 'reaction_respect' | 'reaction_cold' | 'comment_count' | 'bookmark_count' | 'share_count' | 'vibe_score' | 'aura_tips'>;
                Update: Partial<Omit<DbPost, 'id'>>;
            };
            reactions: {
                Row: DbReaction;
                Insert: Omit<DbReaction, 'id' | 'created_at'>;
                Update: { type: string };
            };
            comments: {
                Row: DbComment;
                Insert: Omit<DbComment, 'id' | 'created_at'>;
                Update: Partial<Omit<DbComment, 'id'>>;
            };
            bookmarks: {
                Row: { user_id: string; post_id: string; created_at: string };
                Insert: { user_id: string; post_id: string };
                Update: never;
            };
            swipes: {
                Row: DbSwipe;
                Insert: Omit<DbSwipe, 'id' | 'created_at'>;
                Update: never;
            };
            matches: {
                Row: DbMatch;
                Insert: Omit<DbMatch, 'id' | 'created_at'>;
                Update: Partial<Omit<DbMatch, 'id'>>;
            };
            connections: {
                Row: DbConnection;
                Insert: Omit<DbConnection, 'id' | 'created_at'>;
                Update: Partial<Omit<DbConnection, 'id'>>;
            };
            messages: {
                Row: DbMessage;
                Insert: Omit<DbMessage, 'id' | 'created_at'>;
                Update: Partial<Omit<DbMessage, 'id'>>;
            };
            rooms: {
                Row: DbRoom;
                Insert: Omit<DbRoom, 'id' | 'created_at'>;
                Update: Partial<Omit<DbRoom, 'id'>>;
            };
            room_members: {
                Row: DbRoomMember;
                Insert: Omit<DbRoomMember, 'joined_at'>;
                Update: Partial<DbRoomMember>;
            };
            room_messages: {
                Row: DbRoomMessage;
                Insert: Omit<DbRoomMessage, 'id' | 'created_at'>;
                Update: Partial<Omit<DbRoomMessage, 'id'>>;
            };
            events: {
                Row: DbEvent;
                Insert: Omit<DbEvent, 'id' | 'created_at' | 'rsvp_count'>;
                Update: Partial<Omit<DbEvent, 'id'>>;
            };
            event_tickets: {
                Row: DbEventTicket;
                Insert: Omit<DbEventTicket, 'id' | 'created_at'>;
                Update: Partial<Omit<DbEventTicket, 'id'>>;
            };
            whiteboard_posts: {
                Row: DbWhiteboardPost;
                Insert: Omit<DbWhiteboardPost, 'id' | 'created_at' | 'heart_count' | 'position_x' | 'position_y' | 'rotation'>;
                Update: Partial<Omit<DbWhiteboardPost, 'id'>>;
            };
            whiteboard_hearts: {
                Row: { user_id: string; post_id: string; created_at: string };
                Insert: { user_id: string; post_id: string };
                Update: never;
            };
            notifications: {
                Row: DbNotification;
                Insert: Omit<DbNotification, 'id' | 'created_at'>;
                Update: Partial<Omit<DbNotification, 'id'>>;
            };
            aura_transactions: {
                Row: DbAuraTransaction;
                Insert: Omit<DbAuraTransaction, 'id' | 'created_at'>;
                Update: never;
            };
            confessions: {
                Row: DbConfession;
                Insert: Omit<DbConfession, 'id' | 'created_at' | 'reaction_fire' | 'reaction_seen' | 'reaction_aura' | 'reaction_dead' | 'reaction_respect' | 'reaction_cold'>;
                Update: Partial<Omit<DbConfession, 'id'>>;
            };
            quests: {
                Row: DbQuest;
                Insert: Omit<DbQuest, 'id' | 'created_at'>;
                Update: Partial<Omit<DbQuest, 'id'>>;
            };
            user_quests: {
                Row: DbUserQuest;
                Insert: Omit<DbUserQuest, 'assigned_at'>;
                Update: Partial<DbUserQuest>;
            };
            shop_items: {
                Row: DbShopItem;
                Insert: Omit<DbShopItem, 'id' | 'created_at'>;
                Update: Partial<Omit<DbShopItem, 'id'>>;
            };
            avatar_presets: {
                Row: DbAvatarPreset;
                Insert: Omit<DbAvatarPreset, 'id'>;
                Update: Partial<Omit<DbAvatarPreset, 'id'>>;
            };
        };
        Functions: {
            add_aura: {
                Args: { p_user_id: string; p_amount: number; p_category: string; p_reason: string; p_source_id?: string };
                Returns: number;
            };
            get_feed: {
                Args: { p_user_id: string; p_limit?: number; p_offset?: number };
                Returns: FeedRow[];
            };
        };
    };
}

// Row types
export interface Profile {
    id: string;
    email: string;
    handle: string;
    display_name: string;
    bio: string;
    avatar_url: string | null;
    cover_url: string | null;
    department_id: string | null;
    degree_id: string | null;
    semester: number;
    pronouns: string | null;
    vibe_tags: string[];
    aura_social: number;
    aura_content: number;
    aura_campus: number;
    aura_wisdom: number;
    total_aura: number;
    connection_count: number;
    follower_count: number;
    following_count: number;
    post_count: number;
    is_pro: boolean;
    pro_tier: string | null;
    is_verified: boolean;
    is_dormant: boolean;
    streak_days: number;
    last_active: string;
    last_streak_claim: string | null;
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: string;
    code: string;
    name: string;
    short_name: string;
    color: string;
    icon: string;
    total_aura: number;
    member_count: number;
    created_at: string;
}

export interface Degree {
    id: string;
    department_id: string;
    code: string;
    name: string;
    total_semesters: number;
    created_at: string;
}

export interface DbPost {
    id: string;
    type: string;
    user_id: string | null;
    content: string;
    image_url: string | null;
    is_anonymous: boolean;
    reaction_fire: number;
    reaction_seen: number;
    reaction_aura: number;
    reaction_dead: number;
    reaction_respect: number;
    reaction_cold: number;
    comment_count: number;
    bookmark_count: number;
    share_count: number;
    vibe_score: number;
    aura_tips: number;
    poll_data: unknown;
    hot_take_data: unknown;
    event_data: unknown;
    challenge_data: unknown;
    campus_review_data: unknown;
    study_sos_data: unknown;
    expires_at: string | null;
    created_at: string;
}

export interface DbReaction {
    id: string;
    user_id: string;
    post_id: string;
    type: string;
    created_at: string;
}

export interface DbComment {
    id: string;
    post_id: string;
    user_id: string;
    parent_id: string | null;
    content: string;
    created_at: string;
}

export interface DbSwipe {
    id: string;
    swiper_id: string;
    swiped_id: string;
    direction: string;
    created_at: string;
}

export interface DbMatch {
    id: string;
    user_a: string;
    user_b: string;
    icebreaker_question: string | null;
    icebreaker_answered: boolean;
    chat_unlocked: boolean;
    created_at: string;
}

export interface DbConnection {
    id: string;
    user_id: string;
    connected_user_id: string;
    tier: string;
    message_count: number;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
    created_at: string;
}

export interface DbMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type: string;
    image_url: string | null;
    is_read: boolean;
    created_at: string;
}

export interface DbRoom {
    id: string;
    name: string;
    description: string | null;
    type: string;
    icon: string;
    cover_url: string | null;
    member_count: number;
    is_verified: boolean;
    is_popular: boolean;
    is_featured: boolean;
    has_passcode: boolean;
    passcode_hash: string | null;
    tags: string[];
    created_by: string | null;
    expires_at: string | null;
    last_activity_at: string;
    created_at: string;
}

export interface DbRoomMember {
    room_id: string;
    user_id: string;
    role: string;
    room_aura: number;
    joined_at: string;
}

export interface DbRoomMessage {
    id: string;
    room_id: string;
    layer: string;
    user_id: string;
    content: string;
    image_url: string | null;
    is_pinned: boolean;
    reactions: unknown;
    expires_at: string | null;
    created_at: string;
}

export interface DbEvent {
    id: string;
    title: string;
    description: string | null;
    location: string;
    cover_image_url: string | null;
    organizer_id: string | null;
    society_id: string | null;
    max_capacity: number | null;
    ticket_price: number;
    ticket_type: string;
    external_ticket_url: string | null;
    starts_at: string;
    ends_at: string | null;
    is_featured: boolean;
    is_cancelled: boolean;
    rsvp_count: number;
    created_at: string;
}

export interface DbEventTicket {
    id: string;
    event_id: string;
    user_id: string;
    ticket_code: string;
    status: string;
    aura_paid: number;
    created_at: string;
}

export interface DbWhiteboardPost {
    id: string;
    user_id: string;
    media_url: string;
    media_type: string;
    caption: string | null;
    position_x: number;
    position_y: number;
    rotation: number;
    pin_color: string;
    heart_count: number;
    expires_at: string;
    created_at: string;
}

export interface DbNotification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    emoji: string | null;
    aura_impact: number | null;
    action_url: string | null;
    is_read: boolean;
    created_at: string;
}

export interface DbAuraTransaction {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    reason: string;
    source_id: string | null;
    created_at: string;
}

export interface DbConfession {
    id: string;
    content: string;
    anonymous_name: string;
    anonymous_avatar: string;
    reaction_fire: number;
    reaction_seen: number;
    reaction_aura: number;
    reaction_dead: number;
    reaction_respect: number;
    reaction_cold: number;
    is_iconic: boolean;
    expires_at: string;
    created_at: string;
}

export interface DbQuest {
    id: string;
    type: string;
    difficulty: string;
    title: string;
    description: string;
    icon: string;
    reward: number;
    target: number;
    category: string;
    is_active: boolean;
    created_at: string;
}

export interface DbUserQuest {
    user_id: string;
    quest_id: string;
    progress: number;
    is_completed: boolean;
    is_claimed: boolean;
    assigned_at: string;
    completed_at: string | null;
}

export interface DbShopItem {
    id: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    icon: string | null;
    image_url: string | null;
    rarity: string;
    is_limited: boolean;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

export interface DbAvatarPreset {
    id: string;
    url: string;
    category: string;
    required_aura: number;
    is_active: boolean;
}

export interface FeedRow {
    id: string;
    type: string;
    user_id: string | null;
    content: string;
    image_url: string | null;
    is_anonymous: boolean;
    reaction_fire: number;
    reaction_seen: number;
    reaction_aura: number;
    reaction_dead: number;
    reaction_respect: number;
    reaction_cold: number;
    comment_count: number;
    bookmark_count: number;
    share_count: number;
    vibe_score: number;
    aura_tips: number;
    poll_data: unknown;
    hot_take_data: unknown;
    event_data: unknown;
    challenge_data: unknown;
    campus_review_data: unknown;
    study_sos_data: unknown;
    expires_at: string | null;
    created_at: string;
    author_handle: string;
    author_name: string;
    author_avatar: string;
    author_department: string;
    author_total_aura: number;
    feed_score: number;
}
