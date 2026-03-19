'use client';
/** Feed post card — fully wired to stores with toggle reactions, inline comments, bookmark */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bookmark, Share2, Zap, Send } from 'lucide-react';
import AvatarWithRing from '@/components/shared/AvatarWithRing';
import AuraBadge from '@/components/aura/AuraBadge';
import { REACTIONS } from '@/lib/design-system';
import { timeAgo } from '@/lib/utils';
import { useFeedStore } from '@/store/feedStore';
import { useAuraStore } from '@/store/auraStore';
import { useToastStore } from '@/store/toastStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Post, ReactionType } from '@/types/post';

const AURA_PER_REACTION: Record<ReactionType, number> = { fire: 3, aura: 5, respect: 4, seen: 1, dead: 2, cold: -1 };

interface FeedPostProps { post: Post; }

export default function FeedPost({ post }: FeedPostProps) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const userReaction = useFeedStore((s) => s.userReactions[post.id]);
    const isBookmarked = useFeedStore((s) => s.bookmarks.has(post.id));
    const reactToPost = useFeedStore((s) => s.reactToPost);
    const bookmarkPost = useFeedStore((s) => s.bookmarkPost);
    const addComment = useFeedStore((s) => s.addComment);
    const addAura = useAuraStore((s) => s.addAura);
    const addToast = useToastStore((s) => s.addToast);
    const addNotification = useNotificationStore((s) => s.addNotification);

    // Read live post data from store
    const livePost = useFeedStore((s) => s.posts.find((p) => p.id === post.id)) || post;

    const handleReaction = (type: ReactionType) => {
        const { removed } = reactToPost(post.id, type);

        if (!removed && !post.isAnonymous) {
            // Give aura to post author
            const auraAmount = AURA_PER_REACTION[type] || 2;
            if (auraAmount > 0) {
                addAura(auraAmount, 'content', `Reaction on your post`);
                addToast('aura', `+${auraAmount} aura earned!`, auraAmount);
            }
            addNotification({
                type: 'auraGain',
                title: 'New Reaction',
                message: `Someone reacted ${REACTIONS.find((r) => r.type === type)?.emoji || '🔥'} to your post`,
                emoji: REACTIONS.find((r) => r.type === type)?.emoji || '🔥',
                auraImpact: auraAmount,
                actionUrl: '/feed',
            });
        }
    };

    const handleBookmark = () => {
        const nowBookmarked = bookmarkPost(post.id);
        if (nowBookmarked) {
            addToast('success', 'Post bookmarked! 🔖');
        }
    };

    const handleSendComment = () => {
        if (!commentText.trim()) return;
        addComment(post.id, commentText.trim());
        addAura(2, 'content', 'Commented on post');
        addToast('aura', '+2 aura for commenting!', 2);
        setCommentText('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b px-4 py-4"
            style={{ borderColor: '#1F1F1F' }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                {livePost.isAnonymous ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #F97316)' }}>👻</div>
                ) : (
                    <AvatarWithRing src={livePost.userAvatar} alt={livePost.userName} size={38} auraScore={0} />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{livePost.isAnonymous ? 'Anonymous' : livePost.userName}</span>
                        {!livePost.isAnonymous && <AuraBadge score={0} size="sm" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                        {!livePost.isAnonymous && <span>@{livePost.userHandle}</span>}
                        <span>·</span>
                        <span>{timeAgo(livePost.createdAt)}</span>
                    </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full text-text-dim" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    {livePost.type === 'confession' ? '🤫 Confession' : livePost.type === 'hotTake' ? '🎤 Hot Take' : livePost.type === 'studySOS' ? '🆘 Study SOS' : livePost.type === 'poll' ? '📊 Poll' : livePost.type === 'rant' ? '😤 Rant' : livePost.type === 'eventDrop' ? '📅 Event' : livePost.type === 'challenge' ? '⚔️ Challenge' : livePost.type === 'appreciation' ? '💜 Appreciation' : livePost.type === 'campusReview' ? '📍 Review' : livePost.type === 'auraFlex' ? '✨ Flex' : livePost.type === 'prediction' ? '🔮 Prediction' : livePost.type === 'collabRequest' ? '🤝 Collab' : livePost.type === 'visualDrop' ? '📸 Visual' : '💬'}
                </span>
            </div>

            {/* Content */}
            <p className="text-[15px] leading-relaxed mb-3 text-text-primary">{livePost.content}</p>

            {/* Image */}
            {livePost.imageUrl && (
                <div className="mb-3 rounded-xl overflow-hidden">
                    <img src={livePost.imageUrl} alt="" className="w-full h-48 object-cover" />
                </div>
            )}

            {/* Poll Options */}
            {livePost.pollOptions && (
                <div className="mb-3 space-y-2">
                    {livePost.pollOptions.map((opt) => (
                        <div key={opt.id} className="relative overflow-hidden rounded-lg p-3" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                            <div className="absolute inset-y-0 left-0 rounded-lg" style={{ width: `${opt.percentage}%`, background: 'rgba(168,85,247,0.15)' }} />
                            <div className="relative flex items-center justify-between">
                                <span className="text-sm">{opt.text}</span>
                                <span className="text-sm font-semibold text-purple">{opt.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hot Take Bar */}
            {livePost.hotTakeData && (
                <div className="mb-3 rounded-lg overflow-hidden p-3" style={{ background: '#1A1A1A' }}>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-green">👍 {livePost.hotTakeData.agreePercentage}%</span>
                        <span className="text-xs text-text-dim">{livePost.hotTakeData.totalVotes} votes</span>
                        <span className="text-red">👎 {livePost.hotTakeData.disagreePercentage}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden flex" style={{ background: '#2A2A2A' }}>
                        <div className="h-full rounded-l-full" style={{ width: `${livePost.hotTakeData.agreePercentage}%`, background: '#22C55E' }} />
                        <div className="h-full rounded-r-full" style={{ width: `${livePost.hotTakeData.disagreePercentage}%`, background: '#EF4444' }} />
                    </div>
                </div>
            )}

            {/* Study SOS Badge */}
            {livePost.studySOSData && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                            background: livePost.studySOSData.urgency === 'dueTomorrow' ? '#EF444420' : livePost.studySOSData.urgency === 'kindaUrgent' ? '#FACC1520' : '#22C55E20',
                            color: livePost.studySOSData.urgency === 'dueTomorrow' ? '#EF4444' : livePost.studySOSData.urgency === 'kindaUrgent' ? '#FACC15' : '#22C55E',
                        }}>
                        {livePost.studySOSData.urgency === 'dueTomorrow' ? '🔴' : livePost.studySOSData.urgency === 'kindaUrgent' ? '🟡' : '🟢'} {livePost.studySOSData.courseCode}
                    </span>
                    {livePost.studySOSData.isSolved && <span className="text-xs text-green font-medium">✅ Solved</span>}
                </div>
            )}

            {/* Reactions — toggle logic with glow highlight */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
                {REACTIONS.map((r) => {
                    const isActive = userReaction === r.type;
                    const count = livePost.reactions[r.type as ReactionType] || 0;
                    return (
                        <motion.button
                            key={r.type}
                            onClick={() => handleReaction(r.type as ReactionType)}
                            whileTap={{ scale: 1.2 }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all"
                            style={{
                                background: isActive ? 'rgba(168,85,247,0.15)' : count > 0 ? '#1A1A1A' : 'transparent',
                                border: `1px solid ${isActive ? 'rgba(168,85,247,0.4)' : '#2A2A2A'}`,
                                boxShadow: isActive ? '0 0 8px rgba(168,85,247,0.2)' : 'none',
                            }}
                        >
                            <motion.span animate={isActive ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                                {r.emoji}
                            </motion.span>
                            <span className={isActive ? 'text-purple font-semibold' : 'text-text-secondary'}>{count}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between text-text-dim mt-2">
                <button onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-1.5 text-xs hover:text-text-secondary transition-colors">
                    <MessageCircle size={16} /> {livePost.commentCount}
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-purple transition-colors">
                    <Zap size={16} /> Tip Aura
                </button>
                <motion.button
                    onClick={handleBookmark}
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${isBookmarked ? 'text-yellow' : 'hover:text-text-secondary'}`}>
                    <Bookmark size={16} fill={isBookmarked ? '#FACC15' : 'none'} />
                </motion.button>
                <button className="flex items-center gap-1.5 text-xs hover:text-text-secondary transition-colors">
                    <Share2 size={16} />
                </button>
            </div>

            {/* Inline Comments */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 mt-3" style={{ borderTop: '1px solid #1F1F1F' }}>
                            {/* Existing comments */}
                            {livePost.comments.length === 0 && (
                                <p className="text-xs text-text-dim text-center py-2">No comments yet. Be the first!</p>
                            )}
                            {livePost.comments.map((c) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-2 mb-3"
                                >
                                    <img src={c.userAvatar} alt="" className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-semibold">{c.userName}</span>
                                            <span className="text-[10px] text-text-dim">{timeAgo(c.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-text-secondary">{c.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {/* Comment input */}
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                    className="flex-1 px-3 py-2 rounded-lg text-xs"
                                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none', color: '#E5E5E5' }}
                                />
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleSendComment}
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ background: commentText.trim() ? 'linear-gradient(135deg, #A855F7, #7C3AED)' : '#2A2A2A' }}
                                >
                                    <Send size={12} className="text-white" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
