'use client';
/** Discover page — real Supabase swipes + mutual like matching */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, RotateCcw, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import SwipeCard from '@/components/discover/SwipeCard';
import ConfettiBlast from '@/components/shared/ConfettiBlast';
import NeonButton from '@/components/shared/NeonButton';
import { useDiscoverStore } from '@/store/discoverStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';

type SwipeMode = 'vibeMatch' | 'randomChaos' | 'department' | 'rival' | 'ghost';

const MODES: { id: SwipeMode; label: string }[] = [
    { id: 'vibeMatch', label: '💜 Vibe' },
    { id: 'randomChaos', label: '🎲 Random' },
    { id: 'department', label: '🏫 Dept' },
    { id: 'rival', label: '⚔️ Rival' },
    { id: 'ghost', label: '👻 Ghost' },
];

export default function DiscoverPage() {
    const user = useAuthStore((s) => s.user);
    const addToast = useToastStore((s) => s.addToast);
    const {
        swipeStack, currentIndex, currentCard, cardsLeft,
        currentMode, superAurasRemaining, pendingMatch, isLoading,
        loadDeck, swipeRight, swipeLeft, superAura, setMode, resetDeck, clearPendingMatch,
    } = useDiscoverStore();

    const [swiping, setSwiping] = useState(false);

    // Load deck on mount
    useEffect(() => {
        if (user?.id) {
            loadDeck(user.id, 'vibeMatch', user.department_id);
        }
    }, [user?.id, user?.department_id, loadDeck]);

    const visibleCards = swipeStack.slice(currentIndex, currentIndex + 3);

    const handleSwipeRight = async () => {
        if (!currentCard || !user?.id || swiping) return;
        setSwiping(true);
        try {
            const result = await swipeRight(user.id, currentCard.id);
            if (result?.isMatch) {
                addToast('match', `Mutual match with ${currentCard.display_name}! Chat unlocked 💘`, 20);
            }
        } catch {
            addToast('error', 'Swipe failed');
        }
        setSwiping(false);
    };

    const handleSwipeLeft = async () => {
        if (!currentCard || !user?.id || swiping) return;
        setSwiping(true);
        try {
            await swipeLeft(user.id, currentCard.id);
        } catch {
            addToast('error', 'Swipe failed');
        }
        setSwiping(false);
    };

    const handleSuperAura = async () => {
        if (!currentCard || !user?.id || swiping) return;
        if (superAurasRemaining <= 0) {
            addToast('warning', 'No Super Auras remaining today! ⭐');
            return;
        }
        setSwiping(true);
        try {
            const result = await superAura(user.id, currentCard.id);
            if (result?.isMatch) {
                addToast('match', `Super match with ${currentCard.display_name}! ⭐💘`, 50);
            }
        } catch {
            addToast('error', 'Super Aura failed');
        }
        setSwiping(false);
    };

    const handleModeChange = (mode: SwipeMode) => {
        if (user?.id) {
            setMode(mode);
            loadDeck(user.id, mode, user.department_id);
        }
    };

    return (
        <ScreenTransition>
            <TopBar title="Discover" />

            <div className="px-4 py-2">
                {/* Mode pills */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
                    {MODES.map((m) => (
                        <button key={m.id} onClick={() => handleModeChange(m.id)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                            style={{
                                background: currentMode === m.id ? 'rgba(168,85,247,0.15)' : '#1A1A1A',
                                color: currentMode === m.id ? '#A855F7' : '#555',
                                border: `1px solid ${currentMode === m.id ? 'rgba(168,85,247,0.3)' : '#2A2A2A'}`,
                            }}>
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Info: mutual likes required */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-dim">
                        {isLoading ? 'Loading...' : `${cardsLeft} cards remaining`}
                    </span>
                    <span className="text-xs font-medium" style={{ color: superAurasRemaining > 0 ? '#FACC15' : '#555' }}>
                        ⭐ {superAurasRemaining} Super Auras
                    </span>
                </div>

                {/* Mutual like info banner */}
                <div className="mb-3 px-3 py-2 rounded-lg text-xs text-text-secondary" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    💘 Chat unlocks when <span className="text-purple font-semibold">both</span> users like each other
                </div>

                {/* Card stack */}
                <div className="relative w-full" style={{ height: '420px' }}>
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 size={32} className="text-purple animate-spin" />
                        </div>
                    ) : cardsLeft === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <span className="text-6xl mb-4">😴</span>
                            <h3 className="font-heading text-lg font-bold mb-2">You&apos;ve seen everyone!</h3>
                            <p className="text-sm text-text-secondary mb-4">Come back tomorrow for new faces</p>
                            <NeonButton onClick={() => user?.id && resetDeck(user.id, currentMode, user.department_id)}>
                                <RotateCcw size={16} className="mr-2" /> Reset Deck
                            </NeonButton>
                        </div>
                    ) : (
                        visibleCards.map((profile, i) => (
                            <SwipeCard
                                key={profile.id}
                                user={profile}
                                isTop={i === 0}
                                index={i}
                                onSwipeRight={handleSwipeRight}
                                onSwipeLeft={handleSwipeLeft}
                                onSuperAura={handleSuperAura}
                            />
                        )).reverse()
                    )}
                </div>

                {/* Action buttons */}
                {cardsLeft > 0 && !isLoading && (
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <motion.button whileTap={{ scale: 0.85 }} onClick={handleSwipeLeft}
                            disabled={swiping}
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background: '#EF444420', border: '2px solid #EF444440' }}>
                            <X size={24} className="text-red" />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={handleSuperAura}
                            disabled={swiping}
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: superAurasRemaining > 0 ? '#FACC1520' : '#2A2A2A',
                                border: `2px solid ${superAurasRemaining > 0 ? '#FACC1540' : '#3A3A3A'}`,
                                opacity: superAurasRemaining > 0 ? 1 : 0.4,
                            }}>
                            <Star size={20} className={superAurasRemaining > 0 ? 'text-yellow' : 'text-text-dim'} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={handleSwipeRight}
                            disabled={swiping}
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background: '#22C55E20', border: '2px solid #22C55E40' }}>
                            <Heart size={24} className="text-green" />
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Match Modal */}
            <AnimatePresence>
                {pendingMatch && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[70]" style={{ background: 'rgba(0,0,0,0.85)' }} />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="fixed inset-0 z-[71] flex items-center justify-center p-8"
                        >
                            <ConfettiBlast />
                            <div className="text-center max-w-sm">
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.handle}`} alt=""
                                        className="w-20 h-20 rounded-full" style={{ border: '3px solid #A855F7' }} />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="text-3xl">💘</motion.div>
                                    <img src={pendingMatch.matchedProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=match`} alt=""
                                        className="w-20 h-20 rounded-full" style={{ border: '3px solid #F97316' }} />
                                </div>
                                <h2 className="font-heading text-2xl font-bold aura-gradient mb-2">Mutual Match!</h2>
                                <p className="text-sm text-text-secondary mb-2">
                                    You and <span className="text-purple font-semibold">{pendingMatch.matchedProfile?.display_name}</span> both liked each other!
                                </p>
                                <p className="text-xs text-green mb-4">💬 Chat is now unlocked</p>
                                {pendingMatch.match?.icebreaker_question && (
                                    <div className="p-3 rounded-xl mb-6" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                        <p className="text-xs text-text-dim mb-1">Icebreaker</p>
                                        <p className="text-sm text-text-primary">{pendingMatch.match.icebreaker_question}</p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <NeonButton variant="ghost" fullWidth onClick={clearPendingMatch}>
                                        Keep Swiping
                                    </NeonButton>
                                    <NeonButton fullWidth onClick={clearPendingMatch}>
                                        Send Message
                                    </NeonButton>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </ScreenTransition>
    );
}
