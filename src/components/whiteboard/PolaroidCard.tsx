'use client';
/** Polaroid-style card for the university whiteboard */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';

const PIN_COLORS: Record<string, string> = {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#22C55E',
    yellow: '#FACC15',
    purple: '#A855F7',
};

interface PolaroidCardProps {
    post: any;
    onClick: () => void;
    onHeart: () => void;
    isHearted: boolean;
    index?: number;
}

export default function PolaroidCard({ post, onClick, onHeart, isHearted, index = 0 }: PolaroidCardProps) {
    const [heartAnimating, setHeartAnimating] = useState(false);

    // Random rotation for each card, stable per post id
    const rotation = useMemo(() => {
        const seed = post.id?.charCodeAt(0) || index;
        return ((seed * 7 + index * 3) % 11) - 5; // -5 to 5 degrees
    }, [post.id, index]);

    const pinColor = PIN_COLORS[post.pin_color] || PIN_COLORS.red;

    function handleHeart(e: React.MouseEvent) {
        e.stopPropagation();
        setHeartAnimating(true);
        onHeart();
        setTimeout(() => setHeartAnimating(false), 600);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, rotate: rotation * 2, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, rotate: rotation, scale: 1 }}
            transition={{
                delay: index * 0.07,
                type: 'spring',
                damping: 15,
                stiffness: 200,
            }}
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="relative cursor-pointer group"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {/* Pushpin */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                    {/* Pin shaft */}
                    <rect x="9" y="12" width="2" height="12" rx="1" fill="#888" />
                    {/* Pin head */}
                    <circle cx="10" cy="8" r="7" fill={pinColor} />
                    {/* Pin highlight */}
                    <circle cx="8" cy="6" r="2.5" fill="white" opacity="0.3" />
                </svg>
            </div>

            {/* Polaroid frame */}
            <div
                className="bg-[#f5f5f0] rounded-sm overflow-hidden"
                style={{
                    padding: '8px 8px 0 8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
                }}
            >
                {/* Image area */}
                <div className="relative aspect-square overflow-hidden bg-gray-200">
                    {post.media_url ? (
                        post.media_type === 'video' ? (
                            <div className="relative w-full h-full">
                                <video
                                    src={post.media_url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                                        <Play size={18} className="text-gray-800 ml-0.5" fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={post.media_url}
                                alt={post.caption || ''}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        )
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple/10 to-orange/10 flex items-center justify-center">
                            <span className="text-3xl opacity-30">📌</span>
                        </div>
                    )}

                    {/* Poster avatar - small in corner */}
                    <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full bg-purple flex items-center justify-center text-[8px] font-bold text-white">
                                {post.profiles?.display_name?.[0] || '?'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Caption area - handwriting style */}
                <div className="px-1 pt-2 pb-2.5 min-h-[48px]">
                    {post.caption && (
                        <p
                            className="text-xs leading-relaxed line-clamp-2"
                            style={{
                                color: '#333',
                                fontStyle: 'italic',
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            {post.caption}
                        </p>
                    )}

                    {/* Bottom row: hearts + time */}
                    <div className="flex items-center justify-between mt-1.5">
                        <button
                            onClick={handleHeart}
                            className="relative flex items-center gap-1 transition-transform active:scale-90"
                        >
                            <motion.div animate={heartAnimating ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.3 }}>
                                <Heart
                                    size={14}
                                    className={cn(
                                        'transition-colors',
                                        isHearted ? 'text-red fill-red' : 'text-gray-400'
                                    )}
                                    fill={isHearted ? '#EF4444' : 'none'}
                                />
                            </motion.div>
                            <span className="text-[11px] font-medium" style={{ color: '#666' }}>
                                {post.heart_count || 0}
                            </span>

                            {/* Floating heart animation */}
                            <AnimatePresence>
                                {heartAnimating && isHearted && (
                                    <motion.div
                                        initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                        animate={{ opacity: 0, y: -30, scale: 1.2 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        className="absolute -top-2 left-0 pointer-events-none"
                                    >
                                        <Heart size={16} className="text-red fill-red" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        <span className="text-[10px]" style={{ color: '#999' }}>
                            {timeAgo(new Date(post.created_at))}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
