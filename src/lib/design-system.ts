/* Design system constants used throughout the app */

export const COLORS = {
    bgBase: '#0D0D0D',
    bgSurface: '#1A1A1A',
    bgElevated: '#242424',
    border: '#2A2A2A',
    borderSubtle: '#1F1F1F',
    purple: '#A855F7',
    purpleDim: '#7C3AED',
    yellow: '#FACC15',
    orange: '#F97316',
    green: '#22C55E',
    red: '#EF4444',
    textPrimary: '#FFFFFF',
    textSecondary: '#888888',
    textDim: '#555555',
} as const;

/** Aura level thresholds mapping score ranges to level names */
export const AURA_LEVELS = [
    { min: 0, max: 99, name: 'Shadow', icon: '🌑', color: '#555555', perks: [] },
    { min: 100, max: 499, name: 'Whisper', icon: '🌫️', color: '#6B7280', perks: ['Basic profile customization'] },
    { min: 500, max: 999, name: 'Signal', icon: '📡', color: '#3B82F6', perks: ['Story reactions'] },
    { min: 1000, max: 2499, name: 'Static', icon: '⚡', color: '#8B5CF6', perks: ['Animated profile ring'] },
    { min: 2500, max: 4999, name: 'Flame', icon: '🔥', color: '#F97316', perks: ['Custom bio background'] },
    { min: 5000, max: 9999, name: 'Aura', icon: '✨', color: '#A855F7', perks: ['Profile music'] },
    { min: 10000, max: 14999, name: 'GOAT Contender', icon: '🐐', color: '#EAB308', perks: ['3D rotating avatar'] },
    { min: 15000, max: Infinity, name: 'Campus Legend', icon: '🌌', color: '#F97316', perks: ['All perks', 'Legend badge', 'Rainbow ring'] },
] as const;

/** Aura archetype definitions */
export const AURA_ARCHETYPES = {
    socialite: { name: 'The Socialite', icon: '💜', color: '#A855F7', description: 'Known for connections' },
    creator: { name: 'The Creator', icon: '🔥', color: '#F97316', description: 'Posts move conversations' },
    campusGhost: { name: 'The Campus Ghost', icon: '📍', color: '#22C55E', description: 'Always physically present' },
    oracle: { name: 'The Oracle', icon: '🧠', color: '#3B82F6', description: 'Everyone goes to for help' },
    balanced: { name: 'The Balanced', icon: '⚖️', color: '#FACC15', description: 'No dominant stat, rare' },
    legend: { name: 'The Legend', icon: '🌌', color: '#F97316', description: 'All stats above 5000' },
} as const;

/** Reaction definitions */
export const REACTIONS = [
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'seen', emoji: '👀', label: 'Seen' },
    { type: 'aura', emoji: '✨', label: 'Aura' },
    { type: 'dead', emoji: '💀', label: 'Dead' },
    { type: 'respect', emoji: '🫡', label: 'Respect' },
    { type: 'cold', emoji: '❄️', label: 'Cold' },
] as const;

/** Vibe tag options */
export const VIBE_TAGS = [
    { id: 'gamer', label: '🎮 Gamer' },
    { id: 'nerd', label: '📚 Nerd' },
    { id: 'musicHead', label: '🎵 Music Head' },
    { id: 'foodie', label: '🍕 Foodie' },
    { id: 'athlete', label: '⚽ Athlete' },
    { id: 'artist', label: '🎨 Artist' },
    { id: 'entrepreneur', label: '💼 Entrepreneur' },
    { id: 'memer', label: '😂 Memer' },
] as const;

/** Departments at FAST NUCES Islamabad */
export const DEPARTMENTS = ['CS', 'SE', 'AI', 'CY', 'EE', 'EL', 'BBA', 'ME'] as const;

/** Department metadata */
export const DEPARTMENT_INFO: Record<string, { name: string; color: string; icon: string }> = {
    CS: { name: 'Computer Science', color: '#A855F7', icon: '💻' },
    SE: { name: 'Software Engineering', color: '#3B82F6', icon: '🔧' },
    AI: { name: 'Artificial Intelligence', color: '#EC4899', icon: '🤖' },
    CY: { name: 'Cyber Security', color: '#EF4444', icon: '🔒' },
    EE: { name: 'Electrical Engineering', color: '#F97316', icon: '⚡' },
    EL: { name: 'Electronics', color: '#22C55E', icon: '📡' },
    BBA: { name: 'Business Administration', color: '#FACC15', icon: '💼' },
    ME: { name: 'Mechanical Engineering', color: '#6B7280', icon: '⚙️' },
};

/** Degrees per department */
export const DEGREES: Record<string, { code: string; name: string }[]> = {
    CS: [{ code: 'BSCS', name: 'BS Computer Science' }],
    SE: [{ code: 'BSSE', name: 'BS Software Engineering' }],
    AI: [{ code: 'BSAI', name: 'BS Artificial Intelligence' }],
    CY: [{ code: 'BSCY', name: 'BS Cyber Security' }],
    EE: [{ code: 'BSEE', name: 'BS Electrical Engineering' }],
    EL: [{ code: 'BSEL', name: 'BS Electronics' }],
    BBA: [{ code: 'BBA', name: 'Bachelor of Business Administration' }, { code: 'MBA', name: 'Master of Business Administration' }],
    ME: [{ code: 'BSME', name: 'BS Mechanical Engineering' }],
};

/** Semesters */
export const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'] as const;

/** Framer Motion page transition variants */
export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0 },
};

export const slideUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20 },
};

export const staggerContainer = {
    animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
};
