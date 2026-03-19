'use client';
/** Leaderboard with department rivalry, real Supabase data */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { useAuthStore } from '@/store/authStore';
import { formatAura } from '@/lib/utils';

type TabId = 'individuals' | 'departments';
type Category = 'overall' | 'social' | 'content' | 'campus' | 'wisdom';

const CATEGORIES: { id: Category; label: string }[] = [
    { id: 'overall', label: '🏆 Overall' },
    { id: 'social', label: '💜 Social' },
    { id: 'content', label: '🔥 Content' },
    { id: 'campus', label: '📍 Campus' },
    { id: 'wisdom', label: '🧠 Wisdom' },
];

export default function LeaderboardPage() {
    const user = useAuthStore((s) => s.user);
    const { rankings, departmentRankings, category, isLoading, loadLeaderboard, loadDepartmentRankings, setCategory } = useLeaderboardStore();
    const [activeTab, setActiveTab] = useState<TabId>('individuals');

    useEffect(() => {
        loadLeaderboard('overall');
        loadDepartmentRankings();
    }, [loadLeaderboard, loadDepartmentRankings]);

    const top3 = rankings.slice(0, 3);
    const rest = rankings.slice(3);

    const myRank = rankings.findIndex((r: { id: string }) => r.id === user?.id) + 1;

    return (
        <ScreenTransition>
            <TopBar title="Ranks" />

            <div className="px-4 py-2">
                {/* Main tabs: Individuals vs Departments */}
                <div className="flex gap-2 mb-4">
                    {(['individuals', 'departments'] as TabId[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: activeTab === tab ? 'linear-gradient(135deg, #A855F7, #F97316)' : '#1A1A1A',
                                color: activeTab === tab ? '#fff' : '#555',
                                border: `1px solid ${activeTab === tab ? 'transparent' : '#2A2A2A'}`,
                            }}>
                            {tab === 'individuals' ? '👤 Students' : '🏛️ Departments'}
                        </button>
                    ))}
                </div>

                {activeTab === 'individuals' ? (
                    <>
                        {/* Category tabs */}
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
                            {CATEGORIES.map((c) => (
                                <button key={c.id} onClick={() => setCategory(c.id)}
                                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                                    style={{
                                        background: category === c.id ? 'rgba(168,85,247,0.15)' : '#1A1A1A',
                                        color: category === c.id ? '#A855F7' : '#555',
                                        border: `1px solid ${category === c.id ? 'rgba(168,85,247,0.3)' : '#2A2A2A'}`,
                                    }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-16 skeleton rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Podium */}
                                <div className="flex items-end justify-center gap-3 mb-6">
                                    {/* #2 */}
                                    {top3[1] && (
                                        <div className="text-center" style={{ width: '30%' }}>
                                            <img src={top3[1].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].handle}`} alt="" className="w-14 h-14 rounded-full mx-auto mb-1"
                                                style={{ border: '2px solid #C0C0C0' }} />
                                            <p className="text-xs font-semibold truncate">{top3[1].display_name}</p>
                                            <p className="text-xs">🥈</p>
                                            <p className="text-sm font-bold text-purple">{formatAura(top3[1].total_aura)}</p>
                                            <div className="h-16 mt-2 rounded-t-xl" style={{ background: 'linear-gradient(to top, #C0C0C020, transparent)' }} />
                                        </div>
                                    )}
                                    {/* #1 */}
                                    {top3[0] && (
                                        <div className="text-center" style={{ width: '35%' }}>
                                            <img src={top3[0].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].handle}`} alt="" className="w-18 h-18 rounded-full mx-auto mb-1"
                                                style={{ border: '3px solid #FACC15', width: 72, height: 72 }} />
                                            <p className="text-sm font-semibold truncate">{top3[0].display_name}</p>
                                            <p className="text-lg">👑</p>
                                            <p className="text-lg font-bold text-yellow">{formatAura(top3[0].total_aura)}</p>
                                            <div className="h-24 mt-2 rounded-t-xl" style={{ background: 'linear-gradient(to top, #FACC1520, transparent)' }} />
                                        </div>
                                    )}
                                    {/* #3 */}
                                    {top3[2] && (
                                        <div className="text-center" style={{ width: '30%' }}>
                                            <img src={top3[2].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].handle}`} alt="" className="w-14 h-14 rounded-full mx-auto mb-1"
                                                style={{ border: '2px solid #CD7F32' }} />
                                            <p className="text-xs font-semibold truncate">{top3[2].display_name}</p>
                                            <p className="text-xs">🥉</p>
                                            <p className="text-sm font-bold" style={{ color: '#CD7F32' }}>{formatAura(top3[2].total_aura)}</p>
                                            <div className="h-12 mt-2 rounded-t-xl" style={{ background: 'linear-gradient(to top, #CD7F3220, transparent)' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Full rankings */}
                                <div className="space-y-1">
                                    {rest.map((entry: Record<string, unknown>, index: number) => (
                                        <motion.div
                                            key={entry.id as string}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl"
                                            style={{
                                                background: (entry.id as string) === user?.id ? 'rgba(168,85,247,0.08)' : '#1A1A1A',
                                                border: `1px solid ${(entry.id as string) === user?.id ? 'rgba(168,85,247,0.2)' : '#1F1F1F'}`,
                                            }}
                                        >
                                            <span className="text-sm font-bold text-text-dim w-6 text-center">{index + 4}</span>
                                            <img src={(entry.avatar_url as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.handle}`}
                                                alt="" className="w-9 h-9 rounded-full" style={{ background: '#2A2A2A' }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{entry.display_name as string}</p>
                                                <p className="text-[10px] text-text-dim">
                                                    {(entry.departments as Record<string, unknown>)?.code as string || 'N/A'} · Sem {entry.semester as number || '?'}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-purple">{formatAura(entry.total_aura as number)}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pinned user rank */}
                                {myRank > 0 && (
                                    <div className="sticky bottom-20 mt-4 p-3 rounded-xl"
                                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', backdropFilter: 'blur(12px)' }}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-purple">#{myRank}</span>
                                            <span className="text-sm font-semibold">Your Rank</span>
                                            <span className="text-sm text-purple font-bold ml-auto">{formatAura(user?.total_aura || 0)}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    /* Department Rivalry Tab */
                    <div className="space-y-3">
                        <h3 className="font-heading text-sm font-bold text-text-secondary mb-2">Department War 🏛️⚔️</h3>

                        {departmentRankings.map((dept: Record<string, unknown>, index: number) => {
                            const isTop = index === 0;
                            return (
                                <motion.div
                                    key={dept.id as string}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative rounded-xl overflow-hidden"
                                    style={{
                                        background: '#1A1A1A',
                                        border: isTop ? `2px solid ${dept.color as string}` : '1px solid #2A2A2A',
                                    }}
                                >
                                    {/* Aura fill bar */}
                                    <div className="absolute inset-0 opacity-10"
                                        style={{
                                            background: `linear-gradient(90deg, ${dept.color as string} ${Math.min(100, ((dept.total_aura as number) / ((departmentRankings[0]?.total_aura as number) || 1)) * 100)}%, transparent ${Math.min(100, ((dept.total_aura as number) / ((departmentRankings[0]?.total_aura as number) || 1)) * 100)}%)`,
                                        }} />

                                    <div className="relative flex items-center gap-3 p-4">
                                        <span className="text-lg font-bold" style={{ color: dept.color as string, minWidth: 24 }}>
                                            {index === 0 ? '👑' : `#${index + 1}`}
                                        </span>
                                        <span className="text-2xl">{dept.icon as string}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold" style={{ color: dept.color as string }}>{dept.name as string}</p>
                                            <p className="text-xs text-text-dim">{dept.code as string} · {dept.member_count as number} members</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold" style={{ color: dept.color as string }}>
                                                {formatAura(dept.total_aura as number)}
                                            </p>
                                            <p className="text-[10px] text-text-dim">total aura</p>
                                        </div>
                                    </div>

                                    {/* Rivalry matchup indicator */}
                                    {index < departmentRankings.length - 1 && index < 3 && (
                                        <div className="px-4 pb-3 flex items-center gap-2 text-[10px]">
                                            <span className="text-text-dim">vs</span>
                                            <span style={{ color: departmentRankings[index + 1]?.color as string }}>
                                                {departmentRankings[index + 1]?.code as string}
                                            </span>
                                            <span className="text-text-dim">·</span>
                                            <span className="text-green">
                                                +{Math.max(0, (dept.total_aura as number) - (departmentRankings[index + 1]?.total_aura as number || 0)).toLocaleString()} ahead
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Rivalry explanation */}
                        <div className="mt-4 p-3 rounded-xl text-center" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                            <p className="text-xs text-text-secondary">
                                Every post, reaction & connection by your dept members contributes to the Department War.
                                Represent your department! 🏛️
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </ScreenTransition>
    );
}
