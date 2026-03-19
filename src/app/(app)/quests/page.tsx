'use client';
/** Quests page — daily, weekly, semester, and secret quests */
import { motion } from 'framer-motion';
import { Target, Clock, Zap, Lock } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import GlassCard from '@/components/shared/GlassCard';
import NeonButton from '@/components/shared/NeonButton';
import { FAKE_QUESTS } from '@/lib/fake-data';
import { staggerContainer, staggerItem } from '@/lib/design-system';

export default function QuestsPage() {
    const daily = FAKE_QUESTS.filter(q => q.type === 'daily');
    const weekly = FAKE_QUESTS.filter(q => q.type === 'weekly');
    const semester = FAKE_QUESTS.filter(q => q.type === 'semester');
    const secret = FAKE_QUESTS.filter(q => q.type === 'secret');

    return (
        <ScreenTransition>
            <TopBar title="Quests" />

            <div className="px-4 py-2">
                {/* Streak banner */}
                <GlassCard className="mb-4 text-center">
                    <span className="text-3xl block mb-1">🔥</span>
                    <h3 className="font-heading font-semibold text-lg">22-Day Streak!</h3>
                    <p className="text-xs text-text-secondary">Keep going — 30-day reward: +500 aura & Dedicated badge</p>
                    <div className="mt-2 h-2 rounded-full mx-auto max-w-[200px]" style={{ background: '#2A2A2A' }}>
                        <div className="h-full rounded-full" style={{ width: '73%', background: 'linear-gradient(90deg, #A855F7, #F97316)' }} />
                    </div>
                </GlassCard>

                {/* Daily Quests */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Target size={16} className="text-green" />
                        <h3 className="font-heading text-sm font-semibold">Daily Quests</h3>
                        <span className="text-[10px] text-text-dim ml-auto flex items-center gap-1"><Clock size={10} /> Resets at midnight</span>
                    </div>
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
                        {daily.map(q => (
                            <motion.div key={q.id} variants={staggerItem}>
                                <QuestCard quest={q} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Weekly */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-yellow" />
                        <h3 className="font-heading text-sm font-semibold">Weekly Quests</h3>
                    </div>
                    <div className="space-y-2">
                        {weekly.map(q => <QuestCard key={q.id} quest={q} />)}
                    </div>
                </div>

                {/* Semester */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">🏆</span>
                        <h3 className="font-heading text-sm font-semibold">Semester Quests</h3>
                    </div>
                    <div className="space-y-2">
                        {semester.map(q => <QuestCard key={q.id} quest={q} />)}
                    </div>
                </div>

                {/* Secret */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Lock size={16} className="text-text-dim" />
                        <h3 className="font-heading text-sm font-semibold text-text-dim">Secret Quests</h3>
                    </div>
                    <div className="space-y-2">
                        {secret.map(q => (
                            <div key={q.id} className="p-3 rounded-xl opacity-40" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">❓</span>
                                    <div>
                                        <p className="text-sm font-medium">Hidden Quest</p>
                                        <p className="text-xs text-text-dim">Keep exploring to unlock...</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScreenTransition>
    );
}

function QuestCard({ quest }: { quest: (typeof FAKE_QUESTS)[0] }) {
    const pct = (quest.progress / quest.target) * 100;
    const diffColors = { easy: '#22C55E', medium: '#FACC15', hard: '#EF4444' };

    return (
        <div className="p-3 rounded-xl" style={{ background: '#1A1A1A', border: quest.isCompleted ? '1px solid #22C55E40' : '1px solid #1F1F1F' }}>
            <div className="flex items-center gap-3">
                <span className="text-2xl">{quest.icon}</span>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{quest.title}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${diffColors[quest.difficulty]}20`, color: diffColors[quest.difficulty] }}>
                            {quest.difficulty}
                        </span>
                    </div>
                    <p className="text-xs text-text-dim">{quest.description}</p>
                    <div className="mt-1.5 h-1.5 rounded-full" style={{ background: '#2A2A2A' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: quest.isCompleted ? '#22C55E' : '#A855F7' }} />
                    </div>
                    <p className="text-[10px] text-text-dim mt-1">{quest.progress}/{quest.target}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold text-purple">+{quest.reward}</span>
                    <span className="text-[10px] block text-text-dim">aura</span>
                    {quest.isCompleted && !quest.isClaimed && (
                        <NeonButton size="sm" className="mt-1 text-[10px] px-2 py-1">Claim</NeonButton>
                    )}
                    {quest.isClaimed && <span className="text-xs text-green">✅</span>}
                </div>
            </div>
        </div>
    );
}
