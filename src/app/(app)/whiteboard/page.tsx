'use client';
/** Whiteboard page — cork-board style bulletin board with polaroid posts */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Flame, Sparkles, Heart, X, Play } from 'lucide-react';
import ScreenTransition from '@/components/layout/ScreenTransition';
import TopBar from '@/components/layout/TopBar';
import PolaroidCard from '@/components/whiteboard/PolaroidCard';
import AddPinModal from '@/components/whiteboard/AddPinModal';
import EmptyState from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/authStore';
import {
    getWhiteboardPosts,
    heartWhiteboardPost,
    getUserHearts,
    subscribeToWhiteboard,
} from '@/lib/api/whiteboard';
import { timeAgo } from '@/lib/utils';

type FilterId = 'hour' | 'today' | 'trending';

const FILTERS: { id: FilterId; label: string; icon: typeof Clock }[] = [
    { id: 'hour', label: 'Just Now', icon: Clock },
    { id: 'today', label: 'Today', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: Flame },
];

export default function WhiteboardPage() {
    const user = useAuthStore((s) => s.user);
    const [filter, setFilter] = useState<FilterId>('today');
    const [posts, setPosts] = useState<any[]>([]);
    const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [addPinOpen, setAddPinOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const channelRef = useRef<any>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getWhiteboardPosts(filter);
            setPosts(data || []);

            // Fetch user hearts
            if (user && data && data.length > 0) {
                const ids = data.map((p: any) => p.id);
                const hearts = await getUserHearts(user.id, ids);
                setHeartedIds(hearts);
            }
        } catch (err) {
            console.error('Failed to fetch whiteboard posts:', err);
        } finally {
            setLoading(false);
        }
    }, [filter, user]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Real-time subscription
    useEffect(() => {
        const channel = subscribeToWhiteboard((newPost: any) => {
            setPosts((prev) => [newPost, ...prev]);
        });
        channelRef.current = channel;
        return () => {
            channel?.unsubscribe?.();
        };
    }, []);

    async function handleHeart(postId: string) {
        if (!user) return;
        const wasHearted = heartedIds.has(postId);

        // Optimistic update
        setHeartedIds((prev) => {
            const next = new Set(prev);
            if (wasHearted) next.delete(postId);
            else next.add(postId);
            return next;
        });
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, heart_count: (p.heart_count || 0) + (wasHearted ? -1 : 1) }
                    : p
            )
        );

        try {
            await heartWhiteboardPost(user.id, postId);
        } catch {
            // Revert on error
            setHeartedIds((prev) => {
                const next = new Set(prev);
                if (wasHearted) next.add(postId);
                else next.delete(postId);
                return next;
            });
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? { ...p, heart_count: (p.heart_count || 0) + (wasHearted ? 1 : -1) }
                        : p
                )
            );
        }
    }

    function handleNewPin(post: any) {
        setPosts((prev) => [post, ...prev]);
    }

    return (
        <ScreenTransition>
            <TopBar />

            {/* Header */}
            <div className="px-4 pt-2 pb-1">
                <h1 className="font-heading text-2xl font-bold text-text-primary">The Board</h1>
                <p className="text-sm text-text-secondary mt-0.5">Campus bulletin board</p>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-4 mt-3 mb-4">
                {FILTERS.map((f) => {
                    const Icon = f.icon;
                    const isActive = filter === f.id;
                    return (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full"
                            style={{
                                color: isActive ? '#F97316' : '#555555',
                                background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
                            }}
                        >
                            <Icon size={14} />
                            {f.label}
                            {isActive && (
                                <motion.div
                                    layoutId="board-filter-indicator"
                                    className="absolute inset-0 rounded-full border border-orange/20"
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Cork board */}
            <div
                className="mx-3 rounded-2xl min-h-[60vh] overflow-hidden relative mb-28"
                style={{
                    background: `
                        radial-gradient(ellipse at 20% 30%, rgba(180, 130, 80, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 70%, rgba(160, 110, 60, 0.1) 0%, transparent 50%),
                        linear-gradient(135deg, #3d2b1f 0%, #4a3425 20%, #3a2a1c 40%, #4d3628 60%, #3b2b1e 80%, #3d2b1f 100%)
                    `,
                    boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                {/* Cork texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 10% 20%, white 1px, transparent 1px),
                            radial-gradient(circle at 30% 60%, white 0.5px, transparent 0.5px),
                            radial-gradient(circle at 50% 10%, white 0.8px, transparent 0.8px),
                            radial-gradient(circle at 70% 40%, white 0.5px, transparent 0.5px),
                            radial-gradient(circle at 90% 80%, white 1px, transparent 1px),
                            radial-gradient(circle at 15% 90%, white 0.6px, transparent 0.6px),
                            radial-gradient(circle at 60% 75%, white 0.5px, transparent 0.5px),
                            radial-gradient(circle at 85% 15%, white 0.7px, transparent 0.7px)
                        `,
                        backgroundSize: '100px 100px, 80px 80px, 120px 90px, 90px 110px, 100px 80px, 70px 100px, 110px 70px, 95px 95px',
                    }}
                />

                {/* Board edge shadow */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)' }} />

                <div className="relative p-4 pt-5">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-[3/4] rounded-sm bg-white/[0.05]" style={{ animation: 'shimmer 1.5s linear infinite' }} />
                                ))}
                            </motion.div>
                        ) : posts.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <EmptyState
                                    icon="📌"
                                    title="Board is Empty"
                                    description="Be the first to pin something! Tap the + button to add a post."
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={filter}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 gap-x-3.5 gap-y-5"
                            >
                                {posts.map((post, i) => (
                                    <PolaroidCard
                                        key={post.id}
                                        post={post}
                                        index={i}
                                        onClick={() => setSelectedPost(post)}
                                        onHeart={() => handleHeart(post.id)}
                                        isHearted={heartedIds.has(post.id)}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Detail modal */}
            <AnimatePresence>
                {selectedPost && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPost(null)}
                            className="fixed inset-0 z-[60]"
                            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.85, rotate: 3 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[88%] max-w-[360px]"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
                            >
                                <X size={18} />
                            </button>

                            {/* Enlarged polaroid */}
                            <div
                                className="bg-[#f5f5f0] rounded-sm overflow-hidden"
                                style={{
                                    padding: '10px 10px 0 10px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                                }}
                            >
                                {/* Media */}
                                <div className="relative aspect-square overflow-hidden bg-gray-200 rounded-sm">
                                    {selectedPost.media_type === 'video' ? (
                                        <video
                                            src={selectedPost.media_url}
                                            className="w-full h-full object-cover"
                                            controls
                                            autoPlay
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={selectedPost.media_url}
                                            alt={selectedPost.caption || ''}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Caption + info */}
                                <div className="px-1 pt-3 pb-3">
                                    {selectedPost.caption && (
                                        <p className="text-sm leading-relaxed mb-3" style={{ color: '#333', fontStyle: 'italic' }}>
                                            {selectedPost.caption}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        {/* Poster info */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full border-2 border-gray-200 overflow-hidden">
                                                {selectedPost.profiles?.avatar_url ? (
                                                    <img src={selectedPost.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full bg-purple flex items-center justify-center text-[9px] font-bold text-white">
                                                        {selectedPost.profiles?.display_name?.[0] || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium" style={{ color: '#333' }}>
                                                    {selectedPost.profiles?.display_name || 'Anonymous'}
                                                </p>
                                                <p className="text-[10px]" style={{ color: '#999' }}>
                                                    {timeAgo(new Date(selectedPost.created_at))}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Heart */}
                                        <button
                                            onClick={() => handleHeart(selectedPost.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
                                            style={{
                                                background: heartedIds.has(selectedPost.id) ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.05)',
                                            }}
                                        >
                                            <Heart
                                                size={16}
                                                className={heartedIds.has(selectedPost.id) ? 'text-red' : ''}
                                                style={{ color: heartedIds.has(selectedPost.id) ? '#EF4444' : '#999' }}
                                                fill={heartedIds.has(selectedPost.id) ? '#EF4444' : 'none'}
                                            />
                                            <span className="text-xs font-semibold" style={{ color: heartedIds.has(selectedPost.id) ? '#EF4444' : '#666' }}>
                                                {selectedPost.heart_count || 0}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* FAB - Add Pin */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setAddPinOpen(true)}
                className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                    boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
                }}
            >
                <Plus size={24} className="text-white" />
            </motion.button>

            {/* Add Pin Modal */}
            <AddPinModal
                isOpen={addPinOpen}
                onClose={() => setAddPinOpen(false)}
                onCreated={handleNewPin}
            />
        </ScreenTransition>
    );
}
