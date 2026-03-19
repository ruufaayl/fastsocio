-- ============================================
-- FASTSOCIO - Seed Data
-- Run after schema.sql
-- ============================================

-- Departments
INSERT INTO departments (code, name, short_name, color, icon) VALUES
('CS', 'Computer Science', 'CS', '#A855F7', '💻'),
('SE', 'Software Engineering', 'SE', '#3B82F6', '🔧'),
('AI', 'Artificial Intelligence', 'AI', '#EC4899', '🤖'),
('CY', 'Cyber Security', 'CY', '#EF4444', '🔒'),
('EE', 'Electrical Engineering', 'EE', '#F97316', '⚡'),
('EL', 'Electronics', 'EL', '#22C55E', '📡'),
('BBA', 'Business Administration', 'BBA', '#FACC15', '💼'),
('ME', 'Mechanical Engineering', 'ME', '#6B7280', '⚙️');

-- Degrees
INSERT INTO degrees (department_id, code, name) VALUES
((SELECT id FROM departments WHERE code='CS'), 'BSCS', 'BS Computer Science'),
((SELECT id FROM departments WHERE code='SE'), 'BSSE', 'BS Software Engineering'),
((SELECT id FROM departments WHERE code='AI'), 'BSAI', 'BS Artificial Intelligence'),
((SELECT id FROM departments WHERE code='CY'), 'BSCY', 'BS Cyber Security'),
((SELECT id FROM departments WHERE code='EE'), 'BSEE', 'BS Electrical Engineering'),
((SELECT id FROM departments WHERE code='EL'), 'BSEL', 'BS Electronics'),
((SELECT id FROM departments WHERE code='BBA'), 'BBA', 'Bachelor of Business Administration'),
((SELECT id FROM departments WHERE code='BBA'), 'MBA', 'Master of Business Administration'),
((SELECT id FROM departments WHERE code='ME'), 'BSME', 'BS Mechanical Engineering');

-- Icebreaker Questions
INSERT INTO icebreaker_questions (question) VALUES
('What''s your most chaotic FAST memory? 😂'),
('If you could rename any course, what would it be?'),
('Hottest take about campus food? 🍚'),
('What''s the best floor in CS Block? 🏫'),
('Describe your FAST experience in one emoji 💀'),
('Best place to skip class without getting caught?'),
('What''s your unconventional study hack? 🧠'),
('If FAST had a theme song, what would it be? 🎵'),
('Most underrated spot on campus?'),
('What''s the one thing you''d change about FAST?');

-- Default Avatar Presets
INSERT INTO avatar_presets (url, category) VALUES
('https://api.dicebear.com/7.x/avataaars/svg?seed=default1', 'default'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=default2', 'default'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=default3', 'default'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=default4', 'default'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=default5', 'default'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=default6', 'default'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=default7', 'default'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=default8', 'default'),
('https://api.dicebear.com/7.x/bottts/svg?seed=bot1', 'default'),
('https://api.dicebear.com/7.x/bottts/svg?seed=bot2', 'default'),
('https://api.dicebear.com/7.x/bottts/svg?seed=bot3', 'default'),
('https://api.dicebear.com/7.x/bottts/svg?seed=bot4', 'default'),
('https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun1', 'default'),
('https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun2', 'default'),
('https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun3', 'default'),
('https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun4', 'default');

-- Default Quests
INSERT INTO quests (type, difficulty, title, description, icon, reward, target, category) VALUES
('daily', 'easy', 'React to 5 posts', 'Show some love on the feed', '💬', 10, 5, 'content'),
('daily', 'medium', 'Post in a Room', 'Contribute to any room discussion', '🏠', 25, 1, 'social'),
('daily', 'hard', 'Get 10 reactions', 'Post something that resonates', '🔥', 50, 10, 'content'),
('weekly', 'medium', 'Make 2 new connections', 'Expand your circle this week', '🤝', 100, 2, 'social'),
('weekly', 'hard', '5-day posting streak', 'Post something 5 days in a row', '📝', 150, 5, 'content'),
('semester', 'hard', 'Reach Flame level', 'Hit 2500 total aura', '🔥', 500, 2500, 'social'),
('secret', 'hard', '???', 'Hidden quest — keep exploring', '❓', 200, 1, 'content'),
('secret', 'hard', '???', 'Hidden quest — keep exploring', '❓', 200, 1, 'social');

-- Default Rooms
INSERT INTO rooms (name, description, type, icon, is_verified, is_popular, is_featured, tags) VALUES
('ACM FAST', 'Official ACM FAST chapter discussions', 'official', '💻', true, true, true, ARRAY['coding', 'competitive']),
('GDSC FAST', 'Google Developer Student Clubs at FAST', 'official', '🔵', true, true, true, ARRAY['google', 'dev']),
('Softcom Committee', 'Official Softcom event planning', 'official', '🎪', true, false, false, ARRAY['events', 'softcom']),
('Meme Lords', 'FAST memes only. No cringe allowed.', 'community', '😂', false, true, true, ARRAY['memes', 'fun']),
('CS301 Study Group', 'DB course help and past papers', 'community', '📚', false, false, false, ARRAY['study', 'CS301']),
('Startup Hub', 'Entrepreneurs of FAST unite', 'community', '🚀', false, false, false, ARRAY['startup', 'business']),
('Music Society', 'For the music lovers of FAST', 'official', '🎵', true, true, false, ARRAY['music', 'art']),
('Cricket Team', 'FAST cricket team updates and banter', 'official', '🏏', true, false, false, ARRAY['sports', 'cricket']),
('Speed Programming Club', 'Competitive programming grind', 'official', '⚡', true, false, false, ARRAY['coding', 'cp']);

-- Default Shop Items
INSERT INTO shop_items (name, description, category, price, icon, rarity, is_limited) VALUES
('Neon Tokyo Frame', 'Cyberpunk-inspired profile frame', 'frames', 300, '🌆', 'rare', false),
('Retro Wave Frame', '80s retro aesthetic frame', 'frames', 250, '🌊', 'uncommon', false),
('Midnight Theme', 'Deep dark purple profile theme', 'themes', 400, '🌙', 'rare', false),
('Campus Gold Theme', 'Premium gold accent theme', 'themes', 600, '✨', 'epic', false),
('Aura Shield', '3-day decay protection', 'functional', 300, '🛡️', 'common', false),
('Post Boost', '24hr top of feed placement', 'functional', 200, '🚀', 'common', false),
('Super Aura Refill', '+5 extra Super Auras today', 'functional', 150, '💎', 'common', false),
('Softcom Frame', 'Limited edition Softcom festival frame', 'seasonal', 500, '🎪', 'legendary', true),
('Department Pride Frame', 'Show your department colors', 'frames', 200, '🏫', 'uncommon', false),
('Animated Bio Effects', 'Glowing text effects for your bio', 'themes', 350, '✍️', 'rare', false),
('Incognito Mode', 'Browse unseen for 24 hours', 'functional', 250, '🕵️', 'uncommon', false);

-- Campus Hotspots
INSERT INTO campus_hotspots (name, zone, x, y, type, crowd_level, rating, vibe_rating) VALUES
('CS Block', 'Academic', 35, 30, 'building', 'moderate', 4, 4),
('EE Block', 'Academic', 55, 28, 'building', 'light', 3, 3),
('Cafeteria', 'Social', 45, 55, 'cafeteria', 'packed', 3, 2),
('Library', 'Study', 25, 45, 'library', 'moderate', 5, 5),
('Ground', 'Sports', 65, 60, 'ground', 'light', 4, 4),
('Parking', 'Utility', 75, 80, 'parking', 'packed', 1, 1),
('Main Gate', 'Entry', 50, 90, 'gate', 'moderate', 3, 2),
('Admin Block', 'Admin', 40, 15, 'admin', 'empty', 2, 1);
