-- ============================================
-- FASTSOCIO - Reset Script
-- Run this FIRST to clean up, then run schema.sql
-- ============================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS trg_whiteboard_heart_count ON whiteboard_hearts;
DROP TRIGGER IF EXISTS trg_event_rsvp_count ON event_tickets;
DROP TRIGGER IF EXISTS trg_room_member_count ON room_members;
DROP TRIGGER IF EXISTS trg_bookmark_count ON bookmarks;
DROP TRIGGER IF EXISTS trg_comment_count ON comments;
DROP TRIGGER IF EXISTS trg_reaction_counts ON reactions;
DROP TRIGGER IF EXISTS trg_create_connections ON matches;
DROP TRIGGER IF EXISTS trg_check_match ON swipes;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS update_whiteboard_heart_count() CASCADE;
DROP FUNCTION IF EXISTS update_event_rsvp_count() CASCADE;
DROP FUNCTION IF EXISTS update_room_member_count() CASCADE;
DROP FUNCTION IF EXISTS update_bookmark_count() CASCADE;
DROP FUNCTION IF EXISTS update_comment_count() CASCADE;
DROP FUNCTION IF EXISTS update_reaction_counts() CASCADE;
DROP FUNCTION IF EXISTS create_connections_on_match() CASCADE;
DROP FUNCTION IF EXISTS check_mutual_match() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS add_aura(uuid, int, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS get_feed(uuid, int, int) CASCADE;

-- Drop views
DROP VIEW IF EXISTS department_leaderboard;

-- Drop tables in dependency order
DROP TABLE IF EXISTS user_inventory CASCADE;
DROP TABLE IF EXISTS user_quests CASCADE;
DROP TABLE IF EXISTS aura_transactions CASCADE;
DROP TABLE IF EXISTS campus_hotspots CASCADE;
DROP TABLE IF EXISTS whiteboard_hearts CASCADE;
DROP TABLE IF EXISTS whiteboard_posts CASCADE;
DROP TABLE IF EXISTS event_tickets CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS department_rivalry CASCADE;
DROP TABLE IF EXISTS confessions CASCADE;
DROP TABLE IF EXISTS room_messages CASCADE;
DROP TABLE IF EXISTS room_members CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS societies CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS shop_items CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS icebreaker_questions CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS avatar_presets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS degrees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
