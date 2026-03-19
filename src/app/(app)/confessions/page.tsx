'use client';
/** Confessions page — anonymous feed with reactions and iconic confessions */
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import { FAKE_CONFESSIONS } from '@/lib/fake-data';
import { REACTIONS } from '@/lib/design-system';
import { timeAgo } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/design-system';

export default function ConfessionsPage() {
    return (
        <ScreenTransition>
            <TopBar title="Confessions" showBack backHref="/feed" />

            <div className="px-4 py-2">
                <p className="text-xs text-text-dim text-center mb-4">Fully anonymous. No hints. Pure chaos. 🤫</p>

                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                    {FAKE_CONFESSIONS.map(c => (
                        <motion.div key={c.id} variants={staggerItem}
                            className="p-4 rounded-xl relative"
                            style={{
                                background: '#1A1A1A',
                                border: c.isIconic ? '1px solid rgba(168,85,247,0.4)' : '1px solid #1F1F1F',
                                boxShadow: c.isIconic ? '0 0 20px rgba(168,85,247,0.1)' : 'none',
                            }}>
                            {c.isIconic && (
                                <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#A855F720', color: '#A855F7' }}>
                                    ⭐ Iconic
                                </span>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                                <img src={c.randomAvatar} alt="" className="w-8 h-8 rounded-full" style={{ background: '#242424' }} />
                                <div>
                                    <p className="text-sm font-medium">{c.anonymousName}</p>
                                    <p className="text-[10px] text-text-dim">{timeAgo(c.createdAt)}</p>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed mb-3">{c.content}</p>
                            <div className="flex items-center gap-1 flex-wrap">
                                {REACTIONS.map(r => (
                                    <button key={r.type} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                                        style={{ background: '#24242480', border: '1px solid #2A2A2A' }}>
                                        <span>{r.emoji}</span>
                                        <span className="text-text-dim">{c.reactions[r.type as keyof typeof c.reactions]}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* FAB */}
            <button className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}>
                <Plus size={24} className="text-white" />
            </button>
        </ScreenTransition>
    );
}
