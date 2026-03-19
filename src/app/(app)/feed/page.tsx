'use client';
/** Feed page — real Supabase data with algorithmic feed */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import StoryRow from '@/components/feed/StoryRow';
import FeedPost from '@/components/feed/FeedPost';
import PostComposer from '@/components/feed/PostComposer';
import { useFeedStore } from '@/store/feedStore';
import { useAuthStore } from '@/store/authStore';
import type { FeedLayer } from '@/types/post';

const FEED_TABS: { id: FeedLayer; label: string }[] = [
    { id: 'forYou', label: 'For You' },
    { id: 'campusLive', label: 'Campus Live' },
    { id: 'circle', label: 'Circle' },
];

export default function FeedPage() {
    const user = useAuthStore((s) => s.user);
    const [activeLayer, setActiveLayer] = useState<FeedLayer>('forYou');
    const [composerOpen, setComposerOpen] = useState(false);
    const { posts, isLoading, hasMore, loadFeed } = useFeedStore();

    // Load feed on mount
    useEffect(() => {
        if (user?.id) {
            loadFeed(user.id, true);
        }
    }, [user?.id, loadFeed]);

    const handleRefresh = useCallback(() => {
        if (user?.id) loadFeed(user.id, true);
    }, [user?.id, loadFeed]);

    const handleLoadMore = useCallback(() => {
        if (user?.id && hasMore && !isLoading) loadFeed(user.id, false);
    }, [user?.id, hasMore, isLoading, loadFeed]);

    return (
        <ScreenTransition>
            <TopBar />
            <StoryRow />

            {/* Feed tabs */}
            <div className="flex items-center gap-1 px-4 mb-2">
                {FEED_TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveLayer(tab.id)}
                        className="relative px-4 py-2 text-sm font-medium transition-colors rounded-full"
                        style={{
                            color: activeLayer === tab.id ? '#A855F7' : '#555555',
                            background: activeLayer === tab.id ? 'rgba(168,85,247,0.1)' : 'transparent',
                        }}>
                        {tab.label}
                    </button>
                ))}
                <button onClick={handleRefresh} className="ml-auto text-text-dim hover:text-purple transition-colors p-2">
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Posts */}
            <div>
                {isLoading && posts.length === 0 ? (
                    // Skeleton loader
                    <div className="space-y-4 px-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full skeleton" />
                                    <div className="space-y-1.5">
                                        <div className="w-24 h-3 skeleton" />
                                        <div className="w-16 h-2 skeleton" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-3 skeleton" />
                                    <div className="w-3/4 h-3 skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                        <span className="text-5xl mb-4">📝</span>
                        <h3 className="font-heading text-lg font-bold mb-2">Feed is empty</h3>
                        <p className="text-sm text-text-secondary mb-4">Be the first to post something!</p>
                        <button onClick={() => setComposerOpen(true)} className="btn-primary px-6 py-2.5">
                            Create Post
                        </button>
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <FeedPost key={post.id} post={post} />
                        ))}
                        {hasMore && (
                            <div className="py-4 flex justify-center">
                                <button onClick={handleLoadMore} className="text-xs text-purple hover:underline">
                                    {isLoading ? 'Loading...' : 'Load more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* FAB — opens PostComposer */}
            <motion.button
                onClick={() => setComposerOpen(true)}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #A855F7, #F97316)',
                    boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
                }}>
                <Plus size={24} className="text-white" />
            </motion.button>

            <PostComposer isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
        </ScreenTransition>
    );
}
