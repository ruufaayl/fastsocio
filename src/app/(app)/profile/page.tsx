'use client';
/** Profile page — live aura stats from store, animated radar chart, badge modal, edit profile */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Share2, Settings, MapPin, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import GlassCard from '@/components/shared/GlassCard';
import NeonButton from '@/components/shared/NeonButton';
import AuraBadge from '@/components/aura/AuraBadge';
import AuraRadarChart from '@/components/aura/AuraRadarChart';
import Modal from '@/components/shared/Modal';
import { useAuthStore } from '@/store/authStore';
import { useAuraStore } from '@/store/auraStore';
import { useToastStore } from '@/store/toastStore';
import { formatAura, timeAgo } from '@/lib/utils';
import { getArchetypeInfo } from '@/lib/aura-engine';
import { VIBE_TAGS } from '@/lib/design-system';
import type { Badge } from '@/types/user';

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const updateProfile = useAuthStore((s) => s.updateProfile);
    const { totalAura, stats, level, archetype, transactions } = useAuraStore();
    const addToast = useToastStore((s) => s.addToast);

    const [showEdit, setShowEdit] = useState(false);
    const [showBadge, setShowBadge] = useState<Badge | null>(null);
    const [editBio, setEditBio] = useState(user?.bio || '');

    if (!user) return null;

    const archInfo = getArchetypeInfo(archetype);

    const handleSaveProfile = () => {
        updateProfile({ bio: editBio });
        addToast('success', 'Profile updated! ✅');
        setShowEdit(false);
    };

    return (
        <ScreenTransition>
            <TopBar title="Profile" />

            <div className="px-4 py-2">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <img src={user.avatarUrl} alt={user.displayName}
                        className="w-20 h-20 rounded-full flex-shrink-0" style={{ border: `3px solid ${archInfo.color}` }} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="font-heading text-xl font-bold truncate">{user.displayName}</h1>
                            {user.isVerified && <span>✅</span>}
                        </div>
                        <p className="text-xs text-text-dim mb-1">@{user.handle} · {user.department} · {user.semester}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: archInfo.color + '20', color: archInfo.color }}>{archInfo.name}</span>
                            <AuraBadge score={totalAura} size="sm" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setEditBio(user.bio); setShowEdit(true); }}
                            className="p-2 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                            <Edit3 size={16} className="text-text-dim" />
                        </motion.button>
                        <Link href="/settings">
                            <div className="p-2 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                <Settings size={16} className="text-text-dim" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-text-secondary mb-3">{user.bio}</p>

                {/* Quick stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                    <span><span className="font-bold">{user.connections}</span> <span className="text-text-dim">connections</span></span>
                    <span><span className="font-bold">{user.posts}</span> <span className="text-text-dim">posts</span></span>
                    <span className="flex items-center gap-1"><span className="font-bold text-purple">{formatAura(totalAura)}</span> <span className="text-text-dim">aura</span></span>
                </div>

                {/* Vibe tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {user.vibeTags.map((tag) => {
                        const info = VIBE_TAGS.find((v) => v.id === tag);
                        return info ? (
                            <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                {info.icon} {info.label}
                            </span>
                        ) : null;
                    })}
                </div>

                {/* Aura Stats — live from store */}
                <GlassCard className="mb-4">
                    <h3 className="font-heading font-semibold text-sm mb-3">Aura Map</h3>
                    <div className="flex items-center justify-center mb-3">
                        <AuraRadarChart stats={stats} size={180} />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                            <p className="text-xs text-text-dim">Social</p>
                            <motion.p key={stats.social} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                                className="text-sm font-bold text-purple">{formatAura(stats.social)}</motion.p>
                        </div>
                        <div>
                            <p className="text-xs text-text-dim">Content</p>
                            <motion.p key={stats.content} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                                className="text-sm font-bold text-orange-400">{formatAura(stats.content)}</motion.p>
                        </div>
                        <div>
                            <p className="text-xs text-text-dim">Campus</p>
                            <motion.p key={stats.campus} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                                className="text-sm font-bold text-green">{formatAura(stats.campus)}</motion.p>
                        </div>
                        <div>
                            <p className="text-xs text-text-dim">Wisdom</p>
                            <motion.p key={stats.wisdom} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                                className="text-sm font-bold text-cyan-400">{formatAura(stats.wisdom)}</motion.p>
                        </div>
                    </div>
                </GlassCard>

                {/* Aura Timeline — sparkline */}
                <GlassCard className="mb-4">
                    <h3 className="font-heading font-semibold text-sm mb-3">Aura Timeline</h3>
                    <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {(() => {
                            const data = user.auraHistory;
                            const max = Math.max(...data);
                            const min = Math.min(...data);
                            const range = max - min || 1;
                            const points = data.map((v, i) => `${(i / (data.length - 1)) * 300},${55 - ((v - min) / range) * 50}`).join(' ');
                            return (
                                <>
                                    <polyline fill="url(#sparkGrad)" stroke="none"
                                        points={`0,60 ${points} 300,60`} />
                                    <motion.polyline
                                        fill="none" stroke="#A855F7" strokeWidth="2"
                                        points={points}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                    />
                                </>
                            );
                        })()}
                    </svg>
                    <div className="flex items-center justify-between text-[10px] text-text-dim mt-1">
                        <span>30 days ago</span>
                        <span>Today</span>
                    </div>
                </GlassCard>

                {/* Badges — tap for detail modal */}
                <GlassCard className="mb-4">
                    <h3 className="font-heading font-semibold text-sm mb-3">Badges</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {user.badges.map((badge, i) => (
                            <motion.button
                                key={badge.id}
                                onClick={() => setShowBadge(badge)}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                                style={{
                                    background: badge.isLocked ? '#1A1A1A' : '#1A1A1A',
                                    border: `1px solid ${badge.isLocked ? '#2A2A2A' : '#2A2A2A'}`,
                                    opacity: badge.isLocked ? 0.4 : 1,
                                    filter: badge.isLocked ? 'grayscale(1)' : 'none',
                                }}
                            >
                                <span className="text-2xl">{badge.icon}</span>
                                <span className="text-[9px] text-text-dim text-center truncate w-full">{badge.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </GlassCard>

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                    <GlassCard className="mb-4">
                        <h3 className="font-heading font-semibold text-sm mb-3">Recent Activity</h3>
                        <div className="space-y-2">
                            {transactions.slice(0, 5).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between text-xs">
                                    <span className="text-text-secondary">{tx.reason}</span>
                                    <span className={tx.amount >= 0 ? 'text-green font-semibold' : 'text-red font-semibold'}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Badge Detail Modal */}
            <Modal isOpen={!!showBadge} onClose={() => setShowBadge(null)} title={showBadge?.name || ''}>
                {showBadge && (
                    <div className="text-center">
                        <span className="text-5xl block mb-3">{showBadge.icon}</span>
                        <p className="text-sm text-text-secondary mb-2">{showBadge.description}</p>
                        <p className="text-xs text-text-dim capitalize">{showBadge.rarity} rarity</p>
                        {showBadge.earnedAt && !showBadge.isLocked && (
                            <p className="text-xs text-green mt-1">Earned {timeAgo(showBadge.earnedAt)}</p>
                        )}
                        {showBadge.isLocked && (
                            <p className="text-xs text-text-dim mt-1">🔒 Keep playing to unlock</p>
                        )}
                    </div>
                )}
            </Modal>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEdit && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowEdit(false)} className="fixed inset-0 z-[60]"
                            style={{ background: 'rgba(0,0,0,0.7)' }} />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-0 z-[61] max-w-[430px] mx-auto rounded-t-2xl p-4"
                            style={{ background: '#0D0D0D', border: '1px solid #2A2A2A', borderBottom: 'none' }}
                        >
                            <h3 className="font-heading font-semibold mb-4">Edit Profile</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-text-dim block mb-1">Bio</label>
                                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)}
                                        className="w-full p-3 rounded-xl resize-none text-sm"
                                        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none', color: '#E5E5E5' }}
                                        rows={3} />
                                </div>
                                <div className="flex gap-3">
                                    <NeonButton variant="ghost" fullWidth onClick={() => setShowEdit(false)}>Cancel</NeonButton>
                                    <NeonButton fullWidth onClick={handleSaveProfile}>Save</NeonButton>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </ScreenTransition>
    );
}
