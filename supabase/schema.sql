-- ============================================
-- FASTSOCIO - Complete Database Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- ============================================
-- DEPARTMENTS AND DEGREES
-- ============================================
CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    short_name text NOT NULL,
    color text NOT NULL DEFAULT '#A855F7',
    icon text NOT NULL DEFAULT '💻',
    total_aura bigint DEFAULT 0,
    member_count int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE degrees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    total_semesters int DEFAULT 8,
    created_at timestamptz DEFAULT now()
);

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    handle text UNIQUE NOT NULL,
    display_name text NOT NULL,
    bio text DEFAULT '',
    avatar_url text,
    cover_url text,
    department_id uuid REFERENCES departments(id),
    degree_id uuid REFERENCES degrees(id),
    semester int DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
    pronouns text,
    vibe_tags text[] DEFAULT '{}',
    -- Aura stats
    aura_social int DEFAULT 0,
    aura_content int DEFAULT 0,
    aura_campus int DEFAULT 0,
    aura_wisdom int DEFAULT 0,
    total_aura int GENERATED ALWAYS AS (aura_social + aura_content + aura_campus + aura_wisdom) STORED,
    -- Counters
    connection_count int DEFAULT 0,
    follower_count int DEFAULT 0,
    following_count int DEFAULT 0,
    post_count int DEFAULT 0,
    -- Status
    is_pro boolean DEFAULT false,
    pro_tier text CHECK (pro_tier IN ('basic', 'elite')),
    is_verified boolean DEFAULT false,
    is_dormant boolean DEFAULT false,
    streak_days int DEFAULT 0,
    last_active timestamptz DEFAULT now(),
    last_streak_claim date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_total_aura ON profiles(total_aura DESC);
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_profiles_handle ON profiles(handle);

-- ============================================
-- AVATAR PRESETS
-- ============================================
CREATE TABLE avatar_presets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url text NOT NULL,
    category text NOT NULL DEFAULT 'default',
    required_aura int DEFAULT 0,
    is_active boolean DEFAULT true
);

-- ============================================
-- POSTS
-- ============================================
CREATE TABLE posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN (
        'thread', 'visualDrop', 'hotTake', 'poll', 'confession',
        'auraFlex', 'studySOS', 'eventDrop', 'rant',
        'challenge', 'appreciation', 'campusReview', 'collabRequest', 'prediction'
    )),
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    content text NOT NULL CHECK (char_length(content) <= 2000),
    image_url text,
    is_anonymous boolean DEFAULT false,
    -- Denormalized reaction counts
    reaction_fire int DEFAULT 0,
    reaction_seen int DEFAULT 0,
    reaction_aura int DEFAULT 0,
    reaction_dead int DEFAULT 0,
    reaction_respect int DEFAULT 0,
    reaction_cold int DEFAULT 0,
    comment_count int DEFAULT 0,
    bookmark_count int DEFAULT 0,
    share_count int DEFAULT 0,
    vibe_score int DEFAULT 0,
    aura_tips int DEFAULT 0,
    -- Type-specific JSON data
    poll_data jsonb,
    hot_take_data jsonb,
    event_data jsonb,
    challenge_data jsonb,
    campus_review_data jsonb,
    study_sos_data jsonb,
    -- Lifecycle
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(type);

-- ============================================
-- REACTIONS
-- ============================================
CREATE TABLE reactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('fire', 'seen', 'aura', 'dead', 'respect', 'cold')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, post_id)
);

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) <= 2000),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_comments_post ON comments(post_id, created_at);

-- ============================================
-- BOOKMARKS
-- ============================================
CREATE TABLE bookmarks (
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY(user_id, post_id)
);

-- ============================================
-- SWIPE / DISCOVER
-- ============================================
CREATE TABLE swipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    swiped_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    direction text NOT NULL CHECK (direction IN ('right', 'left', 'super')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(swiper_id, swiped_id)
);

CREATE TABLE icebreaker_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    is_active boolean DEFAULT true
);

CREATE TABLE matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_b uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    icebreaker_question text,
    icebreaker_answered boolean DEFAULT false,
    chat_unlocked boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_a, user_b)
);

-- Trigger: check for mutual match on swipe
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.direction IN ('right', 'super') THEN
        IF EXISTS (
            SELECT 1 FROM swipes
            WHERE swiper_id = NEW.swiped_id
            AND swiped_id = NEW.swiper_id
            AND direction IN ('right', 'super')
        ) THEN
            INSERT INTO matches (user_a, user_b, icebreaker_question, chat_unlocked)
            VALUES (
                LEAST(NEW.swiper_id, NEW.swiped_id),
                GREATEST(NEW.swiper_id, NEW.swiped_id),
                (SELECT question FROM icebreaker_questions WHERE is_active = true ORDER BY random() LIMIT 1),
                true
            )
            ON CONFLICT (user_a, user_b) DO UPDATE SET chat_unlocked = true;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_match
AFTER INSERT ON swipes
FOR EACH ROW EXECUTE FUNCTION check_mutual_match();

-- ============================================
-- CONNECTIONS
-- ============================================
CREATE TABLE connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    connected_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier text DEFAULT 'spark' CHECK (tier IN ('spark', 'connected', 'familiar', 'closeCircle', 'innerCircle')),
    message_count int DEFAULT 0,
    last_message text,
    last_message_at timestamptz,
    unread_count int DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, connected_user_id)
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'auraTip', 'image')),
    image_url text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    created_at DESC
);

-- ============================================
-- ROOMS
-- ============================================
CREATE TABLE rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    type text NOT NULL CHECK (type IN ('official', 'community', 'secret', 'temporal')),
    icon text DEFAULT '🏠',
    cover_url text,
    member_count int DEFAULT 0,
    is_verified boolean DEFAULT false,
    is_popular boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    has_passcode boolean DEFAULT false,
    passcode_hash text,
    tags text[] DEFAULT '{}',
    created_by uuid REFERENCES profiles(id),
    expires_at timestamptz,
    last_activity_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE room_members (
    room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    room_aura int DEFAULT 0,
    joined_at timestamptz DEFAULT now(),
    PRIMARY KEY(room_id, user_id)
);

CREATE TABLE room_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    layer text DEFAULT 'discussion' CHECK (layer IN ('announcements', 'discussion', 'lounge')),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    image_url text,
    is_pinned boolean DEFAULT false,
    reactions jsonb DEFAULT '{}',
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_room_messages ON room_messages(room_id, layer, created_at DESC);

-- ============================================
-- SOCIETIES
-- ============================================
CREATE TABLE societies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    short_name text NOT NULL,
    description text,
    logo_url text,
    cover_url text,
    is_verified boolean DEFAULT false,
    member_count int DEFAULT 0,
    collective_aura bigint DEFAULT 0,
    president_id uuid REFERENCES profiles(id),
    room_id uuid REFERENCES rooms(id),
    join_status text DEFAULT 'open' CHECK (join_status IN ('open', 'applicationRequired', 'inviteOnly')),
    created_at timestamptz DEFAULT now()
);

-- ============================================
-- EVENTS SYSTEM
-- ============================================
CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    location text NOT NULL,
    cover_image_url text,
    organizer_id uuid REFERENCES profiles(id),
    society_id uuid REFERENCES societies(id),
    max_capacity int,
    ticket_price int DEFAULT 0,
    ticket_type text DEFAULT 'free' CHECK (ticket_type IN ('free', 'aura', 'external')),
    external_ticket_url text,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz,
    is_featured boolean DEFAULT false,
    is_cancelled boolean DEFAULT false,
    rsvp_count int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_starts ON events(starts_at);

CREATE TABLE event_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ticket_code text UNIQUE NOT NULL,
    status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'checked_in', 'waitlisted')),
    aura_paid int DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- ============================================
-- WHITEBOARD (polaroid board)
-- ============================================
CREATE TABLE whiteboard_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    media_url text NOT NULL,
    media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
    caption text CHECK (char_length(caption) <= 100),
    position_x numeric DEFAULT (random() * 80 + 10),
    position_y numeric DEFAULT (random() * 70 + 10),
    rotation numeric DEFAULT (random() * 30 - 15),
    pin_color text DEFAULT '#EF4444',
    heart_count int DEFAULT 0,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE whiteboard_hearts (
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES whiteboard_posts(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY(user_id, post_id)
);

CREATE INDEX idx_whiteboard_active ON whiteboard_posts(expires_at DESC);

-- ============================================
-- CONFESSIONS
-- ============================================
CREATE TABLE confessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text NOT NULL CHECK (char_length(content) <= 2000),
    anonymous_name text NOT NULL,
    anonymous_avatar text NOT NULL,
    reaction_fire int DEFAULT 0,
    reaction_seen int DEFAULT 0,
    reaction_aura int DEFAULT 0,
    reaction_dead int DEFAULT 0,
    reaction_respect int DEFAULT 0,
    reaction_cold int DEFAULT 0,
    is_iconic boolean DEFAULT false,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
    created_at timestamptz DEFAULT now()
);

-- ============================================
-- DEPARTMENT RIVALRY
-- ============================================
CREATE TABLE department_rivalry (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dept_a uuid NOT NULL REFERENCES departments(id),
    dept_b uuid NOT NULL REFERENCES departments(id),
    period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'semester')),
    period_start date NOT NULL,
    dept_a_score bigint DEFAULT 0,
    dept_b_score bigint DEFAULT 0,
    winner_id uuid REFERENCES departments(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Department leaderboard view
CREATE OR REPLACE VIEW department_leaderboard AS
SELECT
    d.id, d.code, d.name, d.color, d.icon,
    d.member_count,
    COALESCE(SUM(p.total_aura), 0)::bigint as total_dept_aura,
    COALESCE(AVG(p.total_aura), 0)::int as avg_aura_per_member,
    COUNT(p.id)::int as active_members
FROM departments d
LEFT JOIN profiles p ON p.department_id = d.id AND p.is_dormant = false
GROUP BY d.id
ORDER BY total_dept_aura DESC;

-- ============================================
-- AURA TRANSACTIONS
-- ============================================
CREATE TABLE aura_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount int NOT NULL,
    category text NOT NULL CHECK (category IN ('social', 'content', 'campus', 'wisdom')),
    reason text NOT NULL,
    source_id text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_aura_tx_user ON aura_transactions(user_id, created_at DESC);

-- Aura add function
CREATE OR REPLACE FUNCTION add_aura(
    p_user_id uuid,
    p_amount int,
    p_category text,
    p_reason text,
    p_source_id text DEFAULT NULL
) RETURNS int AS $$
DECLARE
    new_total int;
BEGIN
    -- Update profile aura stat
    IF p_category = 'social' THEN
        UPDATE profiles SET aura_social = aura_social + p_amount, updated_at = now() WHERE id = p_user_id;
    ELSIF p_category = 'content' THEN
        UPDATE profiles SET aura_content = aura_content + p_amount, updated_at = now() WHERE id = p_user_id;
    ELSIF p_category = 'campus' THEN
        UPDATE profiles SET aura_campus = aura_campus + p_amount, updated_at = now() WHERE id = p_user_id;
    ELSIF p_category = 'wisdom' THEN
        UPDATE profiles SET aura_wisdom = aura_wisdom + p_amount, updated_at = now() WHERE id = p_user_id;
    END IF;

    -- Insert transaction record
    INSERT INTO aura_transactions (user_id, amount, category, reason, source_id)
    VALUES (p_user_id, p_amount, p_category, p_reason, p_source_id);

    -- Update department total
    UPDATE departments d SET total_aura = total_aura + p_amount
    FROM profiles p WHERE p.id = p_user_id AND p.department_id = d.id;

    -- Return new total
    SELECT total_aura INTO new_total FROM profiles WHERE id = p_user_id;
    RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- QUESTS
-- ============================================
CREATE TABLE quests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('daily', 'weekly', 'semester', 'secret')),
    difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    reward int NOT NULL,
    target int NOT NULL,
    category text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_quests (
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    progress int DEFAULT 0,
    is_completed boolean DEFAULT false,
    is_claimed boolean DEFAULT false,
    assigned_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    PRIMARY KEY(user_id, quest_id)
);

-- ============================================
-- SHOP
-- ============================================
CREATE TABLE shop_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    category text NOT NULL CHECK (category IN ('frames', 'themes', 'functional', 'seasonal')),
    price int NOT NULL,
    icon text,
    image_url text,
    rarity text DEFAULT 'common',
    is_limited boolean DEFAULT false,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_inventory (
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    purchased_at timestamptz DEFAULT now(),
    PRIMARY KEY(user_id, item_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    emoji text,
    aura_impact int,
    action_url text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- CAMPUS MAP HOTSPOTS
-- ============================================
CREATE TABLE campus_hotspots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    zone text NOT NULL,
    x numeric NOT NULL,
    y numeric NOT NULL,
    type text NOT NULL,
    crowd_level text DEFAULT 'empty',
    rating numeric DEFAULT 3,
    vibe_rating numeric DEFAULT 3,
    ruler_id uuid REFERENCES profiles(id),
    check_in_count int DEFAULT 0,
    active_events int DEFAULT 0,
    recent_review text,
    created_at timestamptz DEFAULT now()
);

-- ============================================
-- FEED ALGORITHM (RPC)
-- ============================================
CREATE OR REPLACE FUNCTION get_feed(
    p_user_id uuid,
    p_limit int DEFAULT 20,
    p_offset int DEFAULT 0
) RETURNS TABLE (
    id uuid,
    type text,
    user_id uuid,
    content text,
    image_url text,
    is_anonymous boolean,
    reaction_fire int,
    reaction_seen int,
    reaction_aura int,
    reaction_dead int,
    reaction_respect int,
    reaction_cold int,
    comment_count int,
    bookmark_count int,
    share_count int,
    vibe_score int,
    aura_tips int,
    poll_data jsonb,
    hot_take_data jsonb,
    event_data jsonb,
    challenge_data jsonb,
    campus_review_data jsonb,
    study_sos_data jsonb,
    expires_at timestamptz,
    created_at timestamptz,
    author_handle text,
    author_name text,
    author_avatar text,
    author_department text,
    author_total_aura int,
    feed_score numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.type, p.user_id, p.content, p.image_url, p.is_anonymous,
        p.reaction_fire, p.reaction_seen, p.reaction_aura, p.reaction_dead,
        p.reaction_respect, p.reaction_cold, p.comment_count, p.bookmark_count,
        p.share_count, p.vibe_score, p.aura_tips,
        p.poll_data, p.hot_take_data, p.event_data, p.challenge_data,
        p.campus_review_data, p.study_sos_data,
        p.expires_at, p.created_at,
        CASE WHEN p.is_anonymous THEN 'anonymous' ELSE pr.handle END,
        CASE WHEN p.is_anonymous THEN 'Anonymous' ELSE pr.display_name END,
        CASE WHEN p.is_anonymous THEN '' ELSE COALESCE(pr.avatar_url, '') END,
        CASE WHEN p.is_anonymous THEN '' ELSE COALESCE(d.code, '') END,
        CASE WHEN p.is_anonymous THEN 0 ELSE COALESCE(pr.total_aura, 0) END,
        -- Feed score: recency + engagement + connection bonus
        (
            -- Recency score (0-100, decays over 24h)
            GREATEST(0, 100 - EXTRACT(EPOCH FROM (now() - p.created_at)) / 864)
            -- Engagement bonus
            + (p.reaction_fire + p.reaction_aura + p.reaction_respect + p.reaction_seen + p.reaction_dead + p.reaction_cold) * 0.5
            + p.comment_count * 2
            -- Same department bonus
            + CASE WHEN pr.department_id = (SELECT department_id FROM profiles WHERE id = p_user_id) THEN 20 ELSE 0 END
            -- Connection bonus
            + CASE WHEN EXISTS (
                SELECT 1 FROM matches m
                WHERE (m.user_a = p_user_id AND m.user_b = p.user_id)
                   OR (m.user_b = p_user_id AND m.user_a = p.user_id)
            ) THEN 30 ELSE 0 END
        )::numeric as feed_score
    FROM posts p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    LEFT JOIN departments d ON pr.department_id = d.id
    WHERE (p.expires_at IS NULL OR p.expires_at > now())
    ORDER BY feed_score DESC, p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id OR is_anonymous = true);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Reactions
CREATE POLICY "Reactions are viewable by everyone" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own reactions" ON reactions FOR UPDATE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can read own messages" ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE
    USING (auth.uid() = receiver_id);

-- Swipes
CREATE POLICY "Users can view own swipes" ON swipes FOR SELECT USING (auth.uid() = swiper_id);
CREATE POLICY "Users can swipe" ON swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Matches
CREATE POLICY "Users can view own matches" ON matches FOR SELECT
    USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Whiteboard
CREATE POLICY "Whiteboard posts are viewable" ON whiteboard_posts FOR SELECT USING (true);
CREATE POLICY "Users can create whiteboard posts" ON whiteboard_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own whiteboard posts" ON whiteboard_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Whiteboard hearts viewable" ON whiteboard_hearts FOR SELECT USING (true);
CREATE POLICY "Users can heart" ON whiteboard_hearts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unheart" ON whiteboard_hearts FOR DELETE USING (auth.uid() = user_id);

-- Connections
CREATE POLICY "Users can view own connections" ON connections FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can create connections" ON connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connections" ON connections FOR UPDATE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Room members
CREATE POLICY "Room members viewable" ON room_members FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON room_members FOR DELETE USING (auth.uid() = user_id);

-- Room messages
CREATE POLICY "Room messages viewable by members" ON room_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_members rm WHERE rm.room_id = room_messages.room_id AND rm.user_id = auth.uid())
);
CREATE POLICY "Members can post messages" ON room_messages FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM room_members rm WHERE rm.room_id = room_messages.room_id AND rm.user_id = auth.uid())
);

-- Event tickets
CREATE POLICY "Users can view own tickets" ON event_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can book tickets" ON event_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own tickets" ON event_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Aura transactions
CREATE POLICY "Users can view own transactions" ON aura_transactions FOR SELECT USING (auth.uid() = user_id);

-- Confessions
CREATE POLICY "Confessions are viewable" ON confessions FOR SELECT USING (true);
CREATE POLICY "Anyone can confess" ON confessions FOR INSERT WITH CHECK (true);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE whiteboard_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, handle, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        SPLIT_PART(NEW.email, '@', 1),
        SPLIT_PART(NEW.email, '@', 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- HELPER: Update reaction counts on post
-- ============================================
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        EXECUTE format(
            'UPDATE posts SET reaction_%s = reaction_%s + 1 WHERE id = $1',
            NEW.type, NEW.type
        ) USING NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        EXECUTE format(
            'UPDATE posts SET reaction_%s = GREATEST(0, reaction_%s - 1) WHERE id = $1',
            OLD.type, OLD.type
        ) USING OLD.post_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.type != NEW.type THEN
        EXECUTE format(
            'UPDATE posts SET reaction_%s = GREATEST(0, reaction_%s - 1), reaction_%s = reaction_%s + 1 WHERE id = $1',
            OLD.type, OLD.type, NEW.type, NEW.type
        ) USING NEW.post_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_reaction_counts
AFTER INSERT OR UPDATE OR DELETE ON reactions
FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Helper: Update comment count on post
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Helper: Update bookmark count on post
CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET bookmark_count = bookmark_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET bookmark_count = GREATEST(0, bookmark_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_bookmark_count
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION update_bookmark_count();

-- Helper: Update room member count
CREATE OR REPLACE FUNCTION update_room_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE rooms SET member_count = member_count + 1 WHERE id = NEW.room_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE rooms SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.room_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_room_member_count
AFTER INSERT OR DELETE ON room_members
FOR EACH ROW EXECUTE FUNCTION update_room_member_count();

-- Helper: Update event RSVP count
CREATE OR REPLACE FUNCTION update_event_rsvp_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET rsvp_count = GREATEST(0, rsvp_count - 1) WHERE id = OLD.event_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_event_rsvp_count
AFTER INSERT OR DELETE ON event_tickets
FOR EACH ROW EXECUTE FUNCTION update_event_rsvp_count();

-- Helper: Update whiteboard heart count
CREATE OR REPLACE FUNCTION update_whiteboard_heart_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE whiteboard_posts SET heart_count = heart_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE whiteboard_posts SET heart_count = GREATEST(0, heart_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_whiteboard_heart_count
AFTER INSERT OR DELETE ON whiteboard_hearts
FOR EACH ROW EXECUTE FUNCTION update_whiteboard_heart_count();

-- Helper: Create connections on match
CREATE OR REPLACE FUNCTION create_connections_on_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Create bidirectional connections
    INSERT INTO connections (user_id, connected_user_id, tier)
    VALUES (NEW.user_a, NEW.user_b, 'spark')
    ON CONFLICT (user_id, connected_user_id) DO NOTHING;

    INSERT INTO connections (user_id, connected_user_id, tier)
    VALUES (NEW.user_b, NEW.user_a, 'spark')
    ON CONFLICT (user_id, connected_user_id) DO NOTHING;

    -- Update connection counts
    UPDATE profiles SET connection_count = connection_count + 1 WHERE id IN (NEW.user_a, NEW.user_b);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_connections
AFTER INSERT ON matches
FOR EACH ROW EXECUTE FUNCTION create_connections_on_match();
