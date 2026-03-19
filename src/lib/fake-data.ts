/** Rich fake data for FASTSOCIO demo — 10 students, posts, rooms, quests, etc. */

import type { User, Badge, AuraStats } from '@/types/user';
import type { Post } from '@/types/post';
import type { Quest, Notification, ShopItem, CampusHotspot, LeaderboardEntry } from '@/types/aura';
import type { Room, RoomMessage, Confession, Society } from '@/types/room';
import { getAuraLevel, getAuraArchetype, calculateTotalAura } from '@/lib/aura-engine';
import { getArchetypeInfo } from '@/lib/aura-engine';

// ── Helper ──
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function hoursAgo(n: number) { const d = new Date(); d.setHours(d.getHours() - n); return d; }
function minsAgo(n: number) { const d = new Date(); d.setMinutes(d.getMinutes() - n); return d; }
function genSparkline(base: number, days = 30): number[] {
    return Array.from({ length: days }, (_, i) => Math.max(0, base + Math.floor((Math.random() - 0.4) * 200 * (i / days))));
}

// ── Badges ──
const ALL_BADGES: Badge[] = [
    { id: 'b1', name: 'Early Adopter', icon: '🌟', description: 'Joined in the first week', rarity: 'rare', earnedAt: daysAgo(60), isLocked: false },
    { id: 'b2', name: 'Social Butterfly', icon: '🦋', description: '5 new connections in one day', rarity: 'uncommon', earnedAt: daysAgo(30), isLocked: false },
    { id: 'b3', name: 'Content God', icon: '👑', description: '100 reactions on a single post', rarity: 'epic', earnedAt: daysAgo(10), isLocked: false },
    { id: 'b4', name: 'Streak Master', icon: '🔥', description: '30-day login streak', rarity: 'rare', earnedAt: daysAgo(5), isLocked: false },
    { id: 'b5', name: 'The Oracle', icon: '🧠', description: 'Helped 5 Study SOS', rarity: 'uncommon', isLocked: true, earnedAt: undefined },
    { id: 'b6', name: 'Ghost Whisperer', icon: '👻', description: '10 anonymous posts in one day', rarity: 'epic', isLocked: true, earnedAt: undefined },
    { id: 'b7', name: 'Duel Victor', icon: '⚔️', description: 'Won an Aura Duel', rarity: 'uncommon', earnedAt: daysAgo(15), isLocked: false },
    { id: 'b8', name: 'Campus Ruler', icon: '🏰', description: 'Ruled a location for 7 days', rarity: 'rare', isLocked: true, earnedAt: undefined },
    { id: 'b9', name: 'Dedicated', icon: '💎', description: '30-day streak permanent badge', rarity: 'rare', isLocked: true, earnedAt: undefined },
    { id: 'b10', name: 'Viral Machine', icon: '🚀', description: '100 reactions on a single post', rarity: 'legendary', isLocked: true, earnedAt: undefined },
    { id: 'b11', name: 'Cupid Connection', icon: '💘', description: 'Crush reveal success', rarity: 'epic', isLocked: true, earnedAt: undefined },
    { id: 'b12', name: 'Department GOAT', icon: '🐐', description: '#1 in your department', rarity: 'legendary', earnedAt: daysAgo(2), isLocked: false },
];

function makeUser(
    id: string, email: string, handle: string, displayName: string, bio: string,
    dept: 'CS' | 'EE' | 'BBA' | 'EL' | 'ME', sem: string, stats: AuraStats,
    rank: number, change24h: number, badges: string[], streakDays: number,
    extras: Partial<User> = {}
): User {
    const totalAura = calculateTotalAura(stats);
    const archetype = getAuraArchetype(stats);
    const level = getAuraLevel(totalAura);
    return {
        id, email, handle, displayName, bio,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
        department: dept, semester: sem as User['semester'],
        vibeTags: ['gamer', 'memer'], auraStats: stats, totalAura, archetype, level, rank,
        auraChange24h: change24h, auraHistory: genSparkline(totalAura),
        badges: badges.map(bid => ALL_BADGES.find(b => b.id === bid)!).filter(Boolean),
        connections: Math.floor(Math.random() * 80) + 10,
        followers: Math.floor(Math.random() * 200) + 20,
        following: Math.floor(Math.random() * 150) + 15,
        posts: Math.floor(Math.random() * 50) + 5,
        innerCircle: [], territories: [],
        isPro: totalAura > 5000, proTier: totalAura > 10000 ? 'elite' : totalAura > 5000 ? 'basic' : undefined,
        isAnonymous: false, isDormant: false, streakDays, lastActive: hoursAgo(1),
        joinedAt: daysAgo(90), isVerified: true, ...extras,
    };
}

// ── 10 Fake Students ──
export const FAKE_USERS: User[] = [
    makeUser('u1', 'zara@isb.nu.edu.pk', 'zaraahmed', 'Zara Ahmed', 'queen of CS vibes 💜', 'CS', '5th',
        { social: 2800, content: 2200, campus: 1800, wisdom: 1620 }, 3, 180, ['b1', 'b2', 'b3', 'b4'], 22,
        { vibeTags: ['musicHead', 'artist', 'memer'], territories: ['Library'] }),
    makeUser('u2', 'ali@isb.nu.edu.pk', 'alih', 'Ali Hassan', 'EE grind never stops ⚡', 'EE', '3rd',
        { social: 1200, content: 2800, campus: 900, wisdom: 1200 }, 7, 95, ['b1', 'b7'], 14,
        { vibeTags: ['gamer', 'nerd'] }),
    makeUser('u3', 'fatima@isb.nu.edu.pk', 'fatimam', 'Fatima Malik', 'BBA legend in the making 🐐', 'BBA', '7th',
        { social: 3100, content: 3200, campus: 2800, wisdom: 3200 }, 1, 320, ['b1', 'b2', 'b3', 'b4', 'b12'], 45,
        { vibeTags: ['entrepreneur', 'foodie'], territories: ['Cafeteria', 'Admin Block'] }),
    makeUser('u4', 'usman@isb.nu.edu.pk', 'usmant', 'Usman Tariq', 'helping everyone pass CS301 🧠', 'CS', '7th',
        { social: 600, content: 400, campus: 500, wisdom: 1700 }, 12, -30, ['b1', 'b5'], 8,
        { vibeTags: ['nerd'] }),
    makeUser('u5', 'hira@isb.nu.edu.pk', 'hirak', 'Hira Khan', 'freshman energy ✨', 'CS', '1st',
        { social: 300, content: 250, campus: 200, wisdom: 140 }, 35, 45, ['b1'], 5,
        { vibeTags: ['gamer', 'musicHead'] }),
    makeUser('u6', 'bilal@isb.nu.edu.pk', 'bilala', 'Bilal Ahmed', 'you wont see me online 📍', 'EE', '5th',
        { social: 800, content: 400, campus: 2500, wisdom: 800 }, 9, 60, ['b1', 'b8'], 18,
        { vibeTags: ['athlete', 'foodie'], territories: ['Ground', 'Parking'] }),
    makeUser('u7', 'ayesha@isb.nu.edu.pk', 'ayeshas', 'Ayesha Siddiqui', 'networking is my sport 💜', 'BBA', '3rd',
        { social: 1200, content: 350, campus: 300, wisdom: 250 }, 22, 15, ['b1', 'b2'], 10,
        { vibeTags: ['entrepreneur', 'artist'] }),
    makeUser('u8', 'hamza@isb.nu.edu.pk', 'hamzar', 'Hamza Raza', 'meme king of FAST 🔥', 'CS', '3rd',
        { social: 3500, content: 6800, campus: 2100, wisdom: 3200 }, 2, 410, ['b1', 'b2', 'b3', 'b4', 'b7', 'b12'], 62,
        { vibeTags: ['memer', 'gamer'], territories: ['CS Block'] }),
    makeUser('u9', 'maha@isb.nu.edu.pk', 'mahaq', 'Maha Qureshi', 'just vibing quietly 🌫️', 'EE', '1st',
        { social: 120, content: 100, campus: 130, wisdom: 100 }, 48, -10, [], 2,
        { vibeTags: ['nerd', 'artist'], isDormant: false }),
    makeUser('u10', 'saad@isb.nu.edu.pk', 'saadm', 'Saad Mirza', 'silent but deadly 🤫', 'CS', '5th',
        { social: 3800, content: 800, campus: 2200, wisdom: 3000 }, 4, 200, ['b1', 'b4', 'b7'], 30,
        { vibeTags: ['athlete', 'gamer'] }),
];

/** Currently logged in user (Zara) */
export const CURRENT_USER = FAKE_USERS[0];

// ── 20 Fake Posts ──
export const FAKE_POSTS: Post[] = [
    { id: 'p1', type: 'thread', userId: 'u8', userName: 'Hamza Raza', userAvatar: FAKE_USERS[7].avatarUrl, userHandle: 'hamzar', userArchetype: 'The Creator', userAuraLevel: 'Campus Legend', userDepartment: 'CS', content: 'hot take: the cafeteria biryani has been mid this entire semester and nobody is brave enough to say it 🍚💀', reactions: { fire: 89, seen: 34, aura: 12, dead: 45, respect: 8, cold: 23 }, commentCount: 32, comments: [], bookmarkCount: 15, shareCount: 8, vibeScore: 72, auraTips: 120, isAnonymous: false, createdAt: minsAgo(15), imageUrl: undefined },
    { id: 'p2', type: 'confession', userId: 'anon', userName: 'Anonymous', userAvatar: '', userHandle: 'anonymous', userArchetype: '', userAuraLevel: '', userDepartment: '', content: 'I have a massive crush on someone in CS 5th semester and I think they know but we both pretend they dont 💀', reactions: { fire: 156, seen: 89, aura: 45, dead: 67, respect: 12, cold: 3 }, commentCount: 0, comments: [], bookmarkCount: 45, shareCount: 23, vibeScore: 88, auraTips: 0, isAnonymous: true, createdAt: minsAgo(45) },
    { id: 'p3', type: 'studySOS', userId: 'u5', userName: 'Hira Khan', userAvatar: FAKE_USERS[4].avatarUrl, userHandle: 'hirak', userArchetype: 'The Socialite', userAuraLevel: 'Signal', userDepartment: 'CS', content: 'HELP can someone explain B+ trees for the DB midterm tomorrow literally crying rn 😭', reactions: { fire: 12, seen: 45, aura: 23, dead: 5, respect: 34, cold: 0 }, commentCount: 8, comments: [], bookmarkCount: 12, shareCount: 2, vibeScore: 65, auraTips: 30, isAnonymous: false, createdAt: hoursAgo(1), studySOSData: { courseCode: 'CS301', urgency: 'dueTomorrow', isSolved: false, answerCount: 3 } },
    { id: 'p4', type: 'hotTake', userId: 'u3', userName: 'Fatima Malik', userAvatar: FAKE_USERS[2].avatarUrl, userHandle: 'fatimam', userArchetype: 'The Balanced', userAuraLevel: 'GOAT Contender', userDepartment: 'BBA', content: 'BBA students work harder than CS students. There I said it. 🎤⬇️', reactions: { fire: 67, seen: 120, aura: 8, dead: 34, respect: 23, cold: 89 }, commentCount: 67, comments: [], bookmarkCount: 8, shareCount: 34, vibeScore: 51, auraTips: 20, isAnonymous: false, createdAt: hoursAgo(2), hotTakeData: { agreePercentage: 42, disagreePercentage: 58, totalVotes: 345, status: 'active' } },
    { id: 'p5', type: 'poll', userId: 'u1', userName: 'Zara Ahmed', userAvatar: FAKE_USERS[0].avatarUrl, userHandle: 'zaraahmed', userArchetype: 'The Socialite', userAuraLevel: 'Aura', userDepartment: 'CS', content: 'Best study spot on campus?', reactions: { fire: 23, seen: 56, aura: 12, dead: 0, respect: 8, cold: 0 }, commentCount: 12, comments: [], bookmarkCount: 5, shareCount: 3, vibeScore: 78, auraTips: 0, isAnonymous: false, createdAt: hoursAgo(3), pollOptions: [{ id: 'po1', text: 'Library 📚', votes: 145, percentage: 42 }, { id: 'po2', text: 'CS Block stairs 🪜', votes: 89, percentage: 26 }, { id: 'po3', text: 'Cafeteria corner ☕', votes: 67, percentage: 19 }, { id: 'po4', text: 'Parking lot (car) 🚗', votes: 45, percentage: 13 }] },
    { id: 'p6', type: 'visualDrop', userId: 'u8', userName: 'Hamza Raza', userAvatar: FAKE_USERS[7].avatarUrl, userHandle: 'hamzar', userArchetype: 'The Creator', userAuraLevel: 'Campus Legend', userDepartment: 'CS', content: 'POV: you survived another DB assignment 💀🔥', imageUrl: 'https://picsum.photos/seed/fast1/400/300', reactions: { fire: 234, seen: 67, aura: 89, dead: 123, respect: 45, cold: 12 }, commentCount: 45, comments: [], bookmarkCount: 34, shareCount: 56, vibeScore: 91, auraTips: 250, isAnonymous: false, createdAt: hoursAgo(4) },
    { id: 'p7', type: 'eventDrop', userId: 'u3', userName: 'Fatima Malik', userAvatar: FAKE_USERS[2].avatarUrl, userHandle: 'fatimam', userArchetype: 'The Balanced', userAuraLevel: 'GOAT Contender', userDepartment: 'BBA', content: 'ACM coding competition this Friday! Free pizza for participants 🍕', reactions: { fire: 45, seen: 89, aura: 23, dead: 0, respect: 56, cold: 0 }, commentCount: 23, comments: [], bookmarkCount: 67, shareCount: 34, vibeScore: 85, auraTips: 0, isAnonymous: false, createdAt: hoursAgo(5), eventData: { title: 'ACM Coding Competition', location: 'CS Block Lab 3', dateTime: daysAgo(-2), rsvpCount: 67, maxCapacity: 100 } },
    { id: 'p8', type: 'rant', userId: 'u2', userName: 'Ali Hassan', userAvatar: FAKE_USERS[1].avatarUrl, userHandle: 'alih', userArchetype: 'The Creator', userAuraLevel: 'Aura', userDepartment: 'EE', content: 'WHY IS THE WIFI ALWAYS DOWN DURING LAB SUBMISSIONS I CANNOT DO THIS ANYMORE 😤🔥', reactions: { fire: 78, seen: 45, aura: 5, dead: 34, respect: 12, cold: 8 }, commentCount: 15, comments: [], bookmarkCount: 3, shareCount: 12, vibeScore: 60, auraTips: 10, isAnonymous: false, createdAt: hoursAgo(1), expiresAt: hoursAgo(-5) },
    { id: 'p9', type: 'appreciation', userId: 'u4', userName: 'Usman Tariq', userAvatar: FAKE_USERS[3].avatarUrl, userHandle: 'usmant', userArchetype: 'The Oracle', userAuraLevel: 'Flame', userDepartment: 'CS', content: 'Shoutout to @zaraahmed for sharing her OS notes with the entire batch. Real one. 💜', reactions: { fire: 34, seen: 23, aura: 56, dead: 0, respect: 89, cold: 0 }, commentCount: 8, comments: [], bookmarkCount: 12, shareCount: 5, vibeScore: 95, auraTips: 50, isAnonymous: false, createdAt: hoursAgo(6) },
    { id: 'p10', type: 'challenge', userId: 'u8', userName: 'Hamza Raza', userAvatar: FAKE_USERS[7].avatarUrl, userHandle: 'hamzar', userArchetype: 'The Creator', userAuraLevel: 'Campus Legend', userDepartment: 'CS', content: '@alih I challenge you to post your CGPA right now. No cap. 😂', reactions: { fire: 123, seen: 67, aura: 12, dead: 89, respect: 5, cold: 23 }, commentCount: 34, comments: [], bookmarkCount: 8, shareCount: 45, vibeScore: 70, auraTips: 0, isAnonymous: false, createdAt: hoursAgo(8), challengeData: { targetUserId: 'u2', targetUserName: 'Ali Hassan', challenge: 'Post your CGPA', status: 'pending' } },
    { id: 'p11', type: 'campusReview', userId: 'u6', userName: 'Bilal Ahmed', userAvatar: FAKE_USERS[5].avatarUrl, userHandle: 'bilala', userArchetype: 'The Campus Ghost', userAuraLevel: 'Flame', userDepartment: 'EE', content: 'Cafeteria review: chai is actually fire today, samosa is mid, crowd is insane', reactions: { fire: 23, seen: 34, aura: 5, dead: 12, respect: 8, cold: 3 }, commentCount: 5, comments: [], bookmarkCount: 8, shareCount: 2, vibeScore: 68, auraTips: 0, isAnonymous: false, createdAt: hoursAgo(3), campusReviewData: { locationName: 'Cafeteria', foodRating: 3, vibeRating: 2, crowdLevel: 'packed' } },
    { id: 'p12', type: 'collabRequest', userId: 'u7', userName: 'Ayesha Siddiqui', userAvatar: FAKE_USERS[6].avatarUrl, userHandle: 'ayeshas', userArchetype: 'The Socialite', userAuraLevel: 'Static', userDepartment: 'BBA', content: 'Looking for a CS student to partner on our cross-department startup project. DM if interested!', reactions: { fire: 12, seen: 45, aura: 8, dead: 0, respect: 23, cold: 0 }, commentCount: 7, comments: [], bookmarkCount: 15, shareCount: 8, vibeScore: 75, auraTips: 0, isAnonymous: false, createdAt: hoursAgo(10) },
    { id: 'p13', type: 'prediction', userId: 'u10', userName: 'Saad Mirza', userAvatar: FAKE_USERS[9].avatarUrl, userHandle: 'saadm', userArchetype: 'The Socialite', userAuraLevel: 'Aura', userDepartment: 'CS', content: 'Prediction: Hamza Raza will be Campus Legend by end of this month. Bet on it.', reactions: { fire: 56, seen: 34, aura: 23, dead: 8, respect: 34, cold: 5 }, commentCount: 12, comments: [], bookmarkCount: 5, shareCount: 8, vibeScore: 72, auraTips: 30, isAnonymous: false, createdAt: hoursAgo(12) },
    { id: 'p14', type: 'auraFlex', userId: 'u3', userName: 'Fatima Malik', userAvatar: FAKE_USERS[2].avatarUrl, userHandle: 'fatimam', userArchetype: 'The Balanced', userAuraLevel: 'GOAT Contender', userDepartment: 'BBA', content: 'Just crossed 12,000 Aura ✨🐐 GOAT Contender status unlocked!', reactions: { fire: 145, seen: 67, aura: 89, dead: 5, respect: 78, cold: 12 }, commentCount: 23, comments: [], bookmarkCount: 12, shareCount: 34, vibeScore: 88, auraTips: 200, isAnonymous: false, createdAt: hoursAgo(14) },
    { id: 'p15', type: 'confession', userId: 'anon', userName: 'Anonymous', userAvatar: '', userHandle: 'anonymous', userArchetype: '', userAuraLevel: '', userDepartment: '', content: 'The parking lot at 8am is literally a battle royale and I have seen things that cannot be unseen 🅿️💀', reactions: { fire: 189, seen: 45, aura: 12, dead: 156, respect: 8, cold: 5 }, commentCount: 0, comments: [], bookmarkCount: 23, shareCount: 45, vibeScore: 82, auraTips: 0, isAnonymous: true, createdAt: hoursAgo(16) },
    { id: 'p16', type: 'thread', userId: 'u1', userName: 'Zara Ahmed', userAvatar: FAKE_USERS[0].avatarUrl, userHandle: 'zaraahmed', userArchetype: 'The Socialite', userAuraLevel: 'Aura', userDepartment: 'CS', content: 'unpopular opinion: 8am classes build character and I will not elaborate further ☕', reactions: { fire: 34, seen: 78, aura: 12, dead: 89, respect: 5, cold: 56 }, commentCount: 45, comments: [], bookmarkCount: 8, shareCount: 12, vibeScore: 45, auraTips: 15, isAnonymous: false, createdAt: hoursAgo(18) },
    { id: 'p17', type: 'studySOS', userId: 'u9', userName: 'Maha Qureshi', userAvatar: FAKE_USERS[8].avatarUrl, userHandle: 'mahaq', userArchetype: 'The Campus Ghost', userAuraLevel: 'Shadow', userDepartment: 'EE', content: 'Can anyone share EE201 circuit analysis past papers? Final is next week 🙏', reactions: { fire: 5, seen: 23, aura: 8, dead: 0, respect: 12, cold: 0 }, commentCount: 4, comments: [], bookmarkCount: 8, shareCount: 1, vibeScore: 70, auraTips: 0, isAnonymous: false, createdAt: hoursAgo(20), studySOSData: { courseCode: 'EE201', urgency: 'kindaUrgent', isSolved: true, answerCount: 2 } },
    { id: 'p18', type: 'thread', userId: 'u10', userName: 'Saad Mirza', userAvatar: FAKE_USERS[9].avatarUrl, userHandle: 'saadm', userArchetype: 'The Socialite', userAuraLevel: 'Aura', userDepartment: 'CS', content: 'Day 30 of my streak. The grind doesnt sleep. Neither do I apparently. 😤🔥', reactions: { fire: 67, seen: 23, aura: 34, dead: 12, respect: 45, cold: 3 }, commentCount: 8, comments: [], bookmarkCount: 5, shareCount: 8, vibeScore: 80, auraTips: 40, isAnonymous: false, createdAt: hoursAgo(22) },
    { id: 'p19', type: 'visualDrop', userId: 'u6', userName: 'Bilal Ahmed', userAvatar: FAKE_USERS[5].avatarUrl, userHandle: 'bilala', userArchetype: 'The Campus Ghost', userAuraLevel: 'Flame', userDepartment: 'EE', content: 'sunset from the ground today was unreal 🌅', imageUrl: 'https://picsum.photos/seed/fast2/400/300', reactions: { fire: 78, seen: 34, aura: 56, dead: 0, respect: 45, cold: 0 }, commentCount: 12, comments: [], bookmarkCount: 23, shareCount: 15, vibeScore: 92, auraTips: 60, isAnonymous: false, createdAt: hoursAgo(24) },
    { id: 'p20', type: 'hotTake', userId: 'u2', userName: 'Ali Hassan', userAvatar: FAKE_USERS[1].avatarUrl, userHandle: 'alih', userArchetype: 'The Creator', userAuraLevel: 'Aura', userDepartment: 'EE', content: 'ChatGPT should be allowed in exams. Hear me out. 🤖', reactions: { fire: 89, seen: 67, aura: 12, dead: 45, respect: 23, cold: 78 }, commentCount: 56, comments: [], bookmarkCount: 12, shareCount: 34, vibeScore: 48, auraTips: 15, isAnonymous: false, createdAt: hoursAgo(26), hotTakeData: { agreePercentage: 38, disagreePercentage: 62, totalVotes: 512, status: 'active' } },
];

// ── Fake Rooms ──
export const FAKE_ROOMS: Room[] = [
    { id: 'r1', name: 'ACM FAST', description: 'Official ACM FAST chapter discussions', type: 'official', icon: '💻', memberCount: 245, members: [], messages: [], isVerified: true, isPopular: true, isFeatured: true, hasPasscode: false, tags: ['coding', 'competitive'], createdBy: 'admin', createdAt: daysAgo(180), lastActivityAt: minsAgo(5), topContributors: [{ userId: 'u8', userName: 'Hamza Raza', userAvatar: FAKE_USERS[7].avatarUrl, roomAura: 890 }, { userId: 'u1', userName: 'Zara Ahmed', userAvatar: FAKE_USERS[0].avatarUrl, roomAura: 670 }, { userId: 'u4', userName: 'Usman Tariq', userAvatar: FAKE_USERS[3].avatarUrl, roomAura: 450 }] },
    { id: 'r2', name: 'GDSC FAST', description: 'Google Developer Student Clubs at FAST', type: 'official', icon: '🔵', memberCount: 189, members: [], messages: [], isVerified: true, isPopular: true, isFeatured: true, hasPasscode: false, tags: ['google', 'dev'], createdBy: 'admin', createdAt: daysAgo(150), lastActivityAt: minsAgo(20), topContributors: [] },
    { id: 'r3', name: 'Softcom Committee', description: 'Official Softcom event planning', type: 'official', icon: '🎪', memberCount: 67, members: [], messages: [], isVerified: true, isPopular: false, isFeatured: false, hasPasscode: false, tags: ['events', 'softcom'], createdBy: 'admin', createdAt: daysAgo(120), lastActivityAt: hoursAgo(2), topContributors: [] },
    { id: 'r4', name: 'Meme Lords', description: 'FAST memes only. No cringe allowed.', type: 'community', icon: '😂', memberCount: 312, members: [], messages: [], isVerified: false, isPopular: true, isFeatured: true, hasPasscode: false, tags: ['memes', 'fun'], createdBy: 'u8', createdAt: daysAgo(60), lastActivityAt: minsAgo(2), topContributors: [] },
    { id: 'r5', name: 'CS301 Study Group', description: 'DB course help and past papers', type: 'community', icon: '📚', memberCount: 89, members: [], messages: [], isVerified: false, isPopular: false, isFeatured: false, hasPasscode: false, tags: ['study', 'CS301'], createdBy: 'u4', createdAt: daysAgo(30), lastActivityAt: hoursAgo(1), topContributors: [] },
    { id: 'r6', name: 'Startup Hub', description: 'Entrepreneurs of FAST unite', type: 'community', icon: '🚀', memberCount: 56, members: [], messages: [], isVerified: false, isPopular: false, isFeatured: false, hasPasscode: false, tags: ['startup', 'business'], createdBy: 'u7', createdAt: daysAgo(45), lastActivityAt: hoursAgo(4), topContributors: [] },
    { id: 'r7', name: 'Music Society', description: 'For the music lovers of FAST', type: 'official', icon: '🎵', memberCount: 134, members: [], messages: [], isVerified: true, isPopular: true, isFeatured: false, hasPasscode: false, tags: ['music', 'art'], createdBy: 'admin', createdAt: daysAgo(100), lastActivityAt: hoursAgo(3), topContributors: [] },
    { id: 'r8', name: 'Inner Circle Gang', description: 'Invite only. You know who you are.', type: 'secret', icon: '🔒', memberCount: 8, members: [], messages: [], isVerified: false, isPopular: false, isFeatured: false, hasPasscode: true, tags: ['private'], createdBy: 'u1', createdAt: daysAgo(20), lastActivityAt: minsAgo(30), topContributors: [] },
    { id: 'r9', name: 'Cricket Team', description: 'FAST cricket team updates and banter', type: 'official', icon: '🏏', memberCount: 45, members: [], messages: [], isVerified: true, isPopular: false, isFeatured: false, hasPasscode: false, tags: ['sports', 'cricket'], createdBy: 'admin', createdAt: daysAgo(90), lastActivityAt: hoursAgo(6), topContributors: [] },
    { id: 'r10', name: 'Speed Programming Club', description: 'Competitive programming grind', type: 'official', icon: '⚡', memberCount: 78, members: [], messages: [], isVerified: true, isPopular: false, isFeatured: false, hasPasscode: false, tags: ['coding', 'cp'], createdBy: 'admin', createdAt: daysAgo(110), lastActivityAt: hoursAgo(5), topContributors: [] },
];

// ── Quests ──
export const FAKE_QUESTS: Quest[] = [
    { id: 'q1', type: 'daily', difficulty: 'easy', title: 'React to 5 posts', description: 'Show some love on the feed', icon: '💬', reward: 10, progress: 3, target: 5, isCompleted: false, isClaimed: false, isSecret: false, category: 'content', expiresAt: hoursAgo(-8) },
    { id: 'q2', type: 'daily', difficulty: 'medium', title: 'Post in a Room', description: 'Contribute to any room discussion', icon: '🏠', reward: 25, progress: 0, target: 1, isCompleted: false, isClaimed: false, isSecret: false, category: 'social', expiresAt: hoursAgo(-8) },
    { id: 'q3', type: 'daily', difficulty: 'hard', title: 'Get 10 reactions', description: 'Post something that resonates', icon: '🔥', reward: 50, progress: 7, target: 10, isCompleted: false, isClaimed: false, isSecret: false, category: 'content', expiresAt: hoursAgo(-8) },
    { id: 'q4', type: 'weekly', difficulty: 'medium', title: 'Make 2 new connections', description: 'Expand your circle this week', icon: '🤝', reward: 100, progress: 1, target: 2, isCompleted: false, isClaimed: false, isSecret: false, category: 'social' },
    { id: 'q5', type: 'weekly', difficulty: 'hard', title: '5-day posting streak', description: 'Post something 5 days in a row', icon: '📝', reward: 150, progress: 3, target: 5, isCompleted: false, isClaimed: false, isSecret: false, category: 'content' },
    { id: 'q6', type: 'semester', difficulty: 'hard', title: 'Reach Flame level', description: 'Hit Flame before Week 8', icon: '🔥', reward: 500, progress: 8420, target: 2500, isCompleted: true, isClaimed: true, isSecret: false, category: 'social' },
    { id: 'q7', type: 'secret', difficulty: 'hard', title: '???', description: 'Hidden quest — keep exploring', icon: '❓', reward: 0, progress: 0, target: 1, isCompleted: false, isClaimed: false, isSecret: true, category: 'content' },
    { id: 'q8', type: 'secret', difficulty: 'hard', title: '???', description: 'Hidden quest — keep exploring', icon: '❓', reward: 0, progress: 0, target: 1, isCompleted: false, isClaimed: false, isSecret: true, category: 'social' },
];

// ── Notifications ──
export const FAKE_NOTIFICATIONS: Notification[] = [
    { id: 'n1', type: 'auraGain', title: 'Aura Surge', message: 'Your post got 50+ reactions! +100 aura', emoji: '🔥', auraImpact: 100, actionUrl: '/feed', isRead: false, createdAt: minsAgo(5) },
    { id: 'n2', type: 'newConnection', title: 'New Connection', message: 'You matched with Ali Hassan!', emoji: '💜', actionUrl: '/chat', isRead: false, createdAt: minsAgo(30) },
    { id: 'n3', type: 'anonymousCrush', title: 'Secret Admirer', message: '💌 Someone has a crush on you!', emoji: '💌', actionUrl: '/discover', isRead: false, createdAt: hoursAgo(1) },
    { id: 'n4', type: 'territoryThreat', title: 'Territory Alert', message: 'Someone is challenging your Library territory!', emoji: '🏰', actionUrl: '/map', isRead: false, createdAt: hoursAgo(2) },
    { id: 'n5', type: 'comment', title: 'New Comment', message: 'Hamza Raza commented on your post', emoji: '💬', actionUrl: '/feed', isRead: true, createdAt: hoursAgo(3) },
    { id: 'n6', type: 'auraEvent', title: 'Double Aura!', message: '⚡ DOUBLE AURA EVENT starting in 10 mins!', emoji: '⚡', actionUrl: '/feed', isRead: true, createdAt: hoursAgo(4) },
    { id: 'n7', type: 'questRefresh', title: 'New Quests', message: 'Daily quests refreshed! 3 new quests available', emoji: '🎯', actionUrl: '/quests', isRead: true, createdAt: hoursAgo(8) },
    { id: 'n8', type: 'rivalActivity', title: 'Rival Alert', message: 'Saad Mirza gained 200 aura while you were offline', emoji: '⚔️', auraImpact: 0, actionUrl: '/leaderboard', isRead: true, createdAt: hoursAgo(10) },
    { id: 'n9', type: 'levelUp', title: 'Level Up!', message: 'You reached Aura level! New perks unlocked ✨', emoji: '✨', auraImpact: 0, actionUrl: '/profile', isRead: true, createdAt: daysAgo(2) },
    { id: 'n10', type: 'weeklyRecap', title: 'Weekly Recap', message: 'You gained 450 aura this week. Top 5% of campus!', emoji: '📊', actionUrl: '/profile', isRead: true, createdAt: daysAgo(3) },
];

// ── Shop Items ──
export const FAKE_SHOP_ITEMS: ShopItem[] = [
    { id: 's1', name: 'Neon Tokyo Frame', description: 'Cyberpunk-inspired profile frame', category: 'frames', price: 300, icon: '🌆', rarity: 'rare', isOwned: false, isLimited: false },
    { id: 's2', name: 'Retro Wave Frame', description: '80s retro aesthetic frame', category: 'frames', price: 250, icon: '🌊', rarity: 'uncommon', isOwned: true, isLimited: false },
    { id: 's3', name: 'Midnight Theme', description: 'Deep dark purple profile theme', category: 'themes', price: 400, icon: '🌙', rarity: 'rare', isOwned: false, isLimited: false },
    { id: 's4', name: 'Campus Gold Theme', description: 'Premium gold accent theme', category: 'themes', price: 600, icon: '✨', rarity: 'epic', isOwned: false, isLimited: false },
    { id: 's5', name: 'Aura Shield', description: '3-day decay protection', category: 'functional', price: 300, icon: '🛡️', rarity: 'common', isOwned: false, isLimited: false },
    { id: 's6', name: 'Post Boost', description: '24hr top of feed placement', category: 'functional', price: 200, icon: '🚀', rarity: 'common', isOwned: false, isLimited: false },
    { id: 's7', name: 'Super Aura Refill', description: '+5 extra Super Auras today', category: 'functional', price: 150, icon: '💎', rarity: 'common', isOwned: false, isLimited: false },
    { id: 's8', name: 'Softcom Frame', description: 'Limited edition Softcom festival frame', category: 'seasonal', price: 500, icon: '🎪', rarity: 'legendary', isOwned: false, isLimited: true },
    { id: 's9', name: 'Valentine Heart Frame', description: 'Limited Valentine\'s edition', category: 'seasonal', price: 400, icon: '💝', rarity: 'epic', isOwned: false, isLimited: true },
    { id: 's10', name: 'Department Pride Frame', description: 'Show your department colors', category: 'frames', price: 200, icon: '🏫', rarity: 'uncommon', isOwned: false, isLimited: false },
    { id: 's11', name: 'Animated Bio Effects', description: 'Glowing text effects for your bio', category: 'themes', price: 350, icon: '✍️', rarity: 'rare', isOwned: false, isLimited: false },
    { id: 's12', name: 'Incognito Mode', description: 'Browse unseen for 24 hours', category: 'functional', price: 250, icon: '🕵️', rarity: 'uncommon', isOwned: false, isLimited: false },
];

// ── Campus Map Hotspots ──
export const FAKE_HOTSPOTS: CampusHotspot[] = [
    { id: 'h1', name: 'CS Block', zone: 'Academic', x: 35, y: 30, type: 'building', crowdLevel: 'moderate', rating: 4, vibeRating: 4, ruler: 'Hamza Raza', rulerAvatar: FAKE_USERS[7].avatarUrl, checkInCount: 89, activeEvents: 1, recentReview: 'Wifi working today surprisingly' },
    { id: 'h2', name: 'EE Block', zone: 'Academic', x: 55, y: 28, type: 'building', crowdLevel: 'light', rating: 3, vibeRating: 3, checkInCount: 45, activeEvents: 0, recentReview: 'AC is broken again' },
    { id: 'h3', name: 'Cafeteria', zone: 'Social', x: 45, y: 55, type: 'cafeteria', crowdLevel: 'packed', rating: 3, vibeRating: 2, ruler: 'Fatima Malik', rulerAvatar: FAKE_USERS[2].avatarUrl, checkInCount: 234, activeEvents: 0, recentReview: 'Biryani is mid today' },
    { id: 'h4', name: 'Library', zone: 'Study', x: 25, y: 45, type: 'library', crowdLevel: 'moderate', rating: 5, vibeRating: 5, ruler: 'Zara Ahmed', rulerAvatar: FAKE_USERS[0].avatarUrl, checkInCount: 156, activeEvents: 0, recentReview: 'Perfect study vibes' },
    { id: 'h5', name: 'Ground', zone: 'Sports', x: 65, y: 60, type: 'ground', crowdLevel: 'light', rating: 4, vibeRating: 4, ruler: 'Bilal Ahmed', rulerAvatar: FAKE_USERS[5].avatarUrl, checkInCount: 67, activeEvents: 0, recentReview: 'Cricket match happening' },
    { id: 'h6', name: 'Parking', zone: 'Utility', x: 75, y: 80, type: 'parking', crowdLevel: 'packed', rating: 1, vibeRating: 1, ruler: 'Bilal Ahmed', rulerAvatar: FAKE_USERS[5].avatarUrl, checkInCount: 178, activeEvents: 0, recentReview: 'Absolute chaos as usual' },
    { id: 'h7', name: 'Main Gate', zone: 'Entry', x: 50, y: 90, type: 'gate', crowdLevel: 'moderate', rating: 3, vibeRating: 2, checkInCount: 312, activeEvents: 0 },
    { id: 'h8', name: 'Admin Block', zone: 'Admin', x: 40, y: 15, type: 'admin', crowdLevel: 'empty', rating: 2, vibeRating: 1, ruler: 'Fatima Malik', rulerAvatar: FAKE_USERS[2].avatarUrl, checkInCount: 23, activeEvents: 0, recentReview: 'Only go here if you absolutely must' },
];

// ── Societies ──
export const FAKE_SOCIETIES: Society[] = [
    { id: 'soc1', name: 'ACM FAST Chapter', shortName: 'ACM', description: 'Association for Computing Machinery — FAST chapter', logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=acm', coverUrl: 'https://picsum.photos/seed/acm/800/300', isVerified: true, memberCount: 245, collectiveAura: 45600, president: 'Hamza Raza', presidentId: 'u8', events: [], achievements: [], roomId: 'r1', joinStatus: 'applicationRequired' },
    { id: 'soc2', name: 'GDSC FAST', shortName: 'GDSC', description: 'Google Developer Student Clubs at FAST Islamabad', logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=gdsc', coverUrl: 'https://picsum.photos/seed/gdsc/800/300', isVerified: true, memberCount: 189, collectiveAura: 34200, president: 'Zara Ahmed', presidentId: 'u1', events: [], achievements: [], roomId: 'r2', joinStatus: 'open' },
    { id: 'soc3', name: 'Softcom Committee', shortName: 'Softcom', description: 'The team behind FAST\'s biggest annual festival', logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=softcom', coverUrl: 'https://picsum.photos/seed/softcom/800/300', isVerified: true, memberCount: 67, collectiveAura: 18900, president: 'Fatima Malik', presidentId: 'u3', events: [], achievements: [], roomId: 'r3', joinStatus: 'inviteOnly' },
];

// ── Confessions ──
export const FAKE_CONFESSIONS: Confession[] = [
    { id: 'c1', content: 'I have a massive crush on someone in CS 5th semester and I think they know but we both pretend they dont 💀', reactions: { fire: 156, seen: 89, aura: 45, dead: 67, respect: 12, cold: 3 }, isIconic: false, createdAt: minsAgo(45), expiresAt: hoursAgo(-47), randomAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon1', anonymousName: 'Anonymous Panda' },
    { id: 'c2', content: 'The parking lot at 8am is literally a battle royale and I have seen things that cannot be unseen 🅿️💀', reactions: { fire: 189, seen: 45, aura: 12, dead: 156, respect: 8, cold: 5 }, isIconic: false, createdAt: hoursAgo(16), expiresAt: hoursAgo(-32), randomAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon2', anonymousName: 'Anonymous Tiger' },
    { id: 'c3', content: 'I pretend to study at the library but I just sit there scrolling FASTSOCIO for 3 hours 📱😭', reactions: { fire: 234, seen: 123, aura: 67, dead: 89, respect: 45, cold: 8 }, isIconic: true, createdAt: hoursAgo(20), expiresAt: hoursAgo(-28), randomAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon3', anonymousName: 'Anonymous Ghost' },
    { id: 'c4', content: 'I actually enjoy 8am classes but I will never admit this to anyone in my batch', reactions: { fire: 45, seen: 89, aura: 23, dead: 123, respect: 5, cold: 67 }, isIconic: false, createdAt: hoursAgo(24), expiresAt: hoursAgo(-24), randomAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon4', anonymousName: 'Anonymous Fox' },
    { id: 'c5', content: 'To the person who keeps leaving their charger at the CS Block — its mine now. Sorry not sorry. 🔌', reactions: { fire: 178, seen: 67, aura: 34, dead: 145, respect: 12, cold: 23 }, isIconic: false, createdAt: hoursAgo(30), expiresAt: hoursAgo(-18), randomAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon5', anonymousName: 'Anonymous Owl' },
];

// ── Leaderboard ──
export const FAKE_LEADERBOARD: LeaderboardEntry[] = FAKE_USERS
    .sort((a, b) => b.totalAura - a.totalAura)
    .map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        userName: u.displayName,
        userAvatar: u.avatarUrl,
        userHandle: u.handle,
        userDepartment: u.department,
        score: u.totalAura,
        change24h: u.auraChange24h,
        changePercent: Number(((u.auraChange24h / u.totalAura) * 100).toFixed(1)),
        sparkline: u.auraHistory.slice(-7),
        archetype: getArchetypeInfo(u.archetype).name,
        level: u.level.name,
    }));
