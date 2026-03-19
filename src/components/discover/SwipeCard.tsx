'use client';
/** Swipe card — physics-based drag with overlays */
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { User } from '@/types/user';
import AuraBadge from '@/components/aura/AuraBadge';
import { getArchetypeInfo } from '@/lib/aura-engine';
import { VIBE_TAGS } from '@/lib/design-system';

interface SwipeCardProps {
    user: User;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    onSuperAura: () => void;
    isTop: boolean;
    index: number; // 0 = top, 1 = middle, 2 = bottom
}

const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ user, onSwipeLeft, onSwipeRight, onSuperAura, isTop, index }: SwipeCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);

    // Overlays
    const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
    const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
    const superOpacity = useTransform(y, [-SWIPE_THRESHOLD, 0], [1, 0]);

    const archInfo = getArchetypeInfo(user.archetype);
    const compatibility = Math.floor(Math.random() * 30) + 65;

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > SWIPE_THRESHOLD) {
            onSwipeRight();
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
            onSwipeLeft();
        } else if (info.offset.y < -SWIPE_THRESHOLD) {
            onSuperAura();
        }
    };

    // Stack offset
    const scaleVal = 1 - index * 0.05;
    const yOffset = index * 8;

    return (
        <motion.div
            className="absolute inset-0 touch-none"
            style={{
                x: isTop ? x : 0,
                y: isTop ? y : yOffset,
                rotate: isTop ? rotate : 0,
                scale: scaleVal,
                zIndex: 10 - index,
                cursor: isTop ? 'grab' : 'default',
            }}
            drag={isTop}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.9}
            onDragEnd={isTop ? handleDragEnd : undefined}
            animate={!isTop ? { y: yOffset, scale: scaleVal } : undefined}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
            <div className="w-full h-full rounded-2xl overflow-hidden relative"
                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

                {/* Avatar section */}
                <div className="h-[55%] relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${archInfo.color}20, #1A1A1A)` }}>
                    <img src={user.avatarUrl} alt={user.displayName}
                        className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />

                    {/* Like overlay */}
                    {isTop && (
                        <>
                            <motion.div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                                style={{ opacity: likeOpacity, background: 'rgba(34,197,94,0.3)', border: '3px solid #22C55E' }}>
                                <span className="text-6xl">❤️</span>
                            </motion.div>
                            <motion.div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                                style={{ opacity: nopeOpacity, background: 'rgba(239,68,68,0.3)', border: '3px solid #EF4444' }}>
                                <span className="text-6xl">✕</span>
                            </motion.div>
                            <motion.div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                                style={{ opacity: superOpacity, background: 'rgba(250,204,21,0.3)', border: '3px solid #FACC15' }}>
                                <span className="text-6xl">⭐</span>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Info section */}
                <div className="h-[45%] p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading text-xl font-bold">{user.displayName}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: archInfo.color + '20', color: archInfo.color, border: `1px solid ${archInfo.color}40` }}>
                                {archInfo.name}
                            </span>
                        </div>
                        <p className="text-xs text-text-dim mb-2">{user.department} · {user.semester} · @{user.handle}</p>
                        <p className="text-sm text-text-secondary line-clamp-2">{user.bio}</p>
                    </div>

                    <div className="space-y-3">
                        {/* Vibe tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {user.vibeTags.slice(0, 4).map((tag) => {
                                const info = VIBE_TAGS.find((v) => v.id === tag);
                                return info ? (
                                    <span key={tag} className="text-xs px-2 py-1 rounded-full"
                                        style={{ background: '#2A2A2A', color: '#E5E5E5' }}>
                                        {info.icon} {info.label}
                                    </span>
                                ) : null;
                            })}
                        </div>

                        {/* Compatibility + Aura */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-purple font-semibold">✨ {user.totalAura.toLocaleString()}</span>
                                <AuraBadge score={user.totalAura} size="sm" />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                style={{ background: compatibility > 80 ? 'rgba(34,197,94,0.15)' : 'rgba(168,85,247,0.15)', border: `1px solid ${compatibility > 80 ? 'rgba(34,197,94,0.3)' : 'rgba(168,85,247,0.3)'}` }}>
                                <span className="text-xs font-semibold" style={{ color: compatibility > 80 ? '#22C55E' : '#A855F7' }}>
                                    {compatibility}% Vibe
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
