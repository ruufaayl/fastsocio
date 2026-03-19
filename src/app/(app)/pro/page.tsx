'use client';
/** PRO subscription page — 3 tier comparison */
import { motion } from 'framer-motion';
import { Check, X, Crown } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import NeonButton from '@/components/shared/NeonButton';

const features = [
    { name: 'Daily swipes', free: '20', basic: 'Unlimited', elite: 'Unlimited' },
    { name: 'Super Auras/day', free: '3', basic: '10', elite: 'Unlimited' },
    { name: 'See profile viewers', free: false, basic: true, elite: true },
    { name: 'Read receipts', free: false, basic: true, elite: true },
    { name: 'See who swiped you', free: false, basic: false, elite: true },
    { name: 'Post boosts/week', free: '0', basic: '1', elite: '3' },
    { name: 'Animated frames', free: false, basic: false, elite: true },
    { name: 'Secret Rooms', free: false, basic: false, elite: true },
    { name: 'Time Machine Mode', free: false, basic: false, elite: true },
    { name: 'Aura Shield/month', free: '0', basic: '0', elite: '1' },
    { name: 'Profile music', free: false, basic: false, elite: true },
    { name: 'Priority discover', free: false, basic: false, elite: true },
    { name: 'Monthly badge', free: false, basic: false, elite: true },
];

const tiers = [
    { name: 'Free', price: '0', color: '#555', highlight: false },
    { name: 'PRO Basic', price: '199', color: '#A855F7', highlight: false },
    { name: 'PRO Elite', price: '399', color: '#FACC15', highlight: true },
];

export default function ProPage() {
    return (
        <ScreenTransition>
            <TopBar title="FASTSOCIO PRO" showBack backHref="/settings" />

            <div className="px-4 py-4">
                <div className="text-center mb-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                        <Crown size={48} className="text-yellow mx-auto mb-3" />
                    </motion.div>
                    <h2 className="font-heading text-2xl font-bold mb-1">Go <span className="aura-gradient">PRO</span></h2>
                    <p className="text-sm text-text-secondary">Unlock the full FASTSOCIO experience</p>
                </div>

                {/* Tier cards */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {tiers.map(t => (
                        <div key={t.name} className={`rounded-xl p-3 text-center ${t.highlight ? 'ring-1 ring-yellow/30' : ''}`}
                            style={{ background: t.highlight ? 'rgba(250,204,21,0.05)' : '#1A1A1A', border: `1px solid ${t.highlight ? '#FACC1530' : '#1F1F1F'}` }}>
                            {t.highlight && <span className="text-[9px] text-yellow font-semibold uppercase">Popular</span>}
                            <h3 className="font-heading font-semibold text-sm mt-1" style={{ color: t.color }}>{t.name}</h3>
                            <p className="font-heading text-xl font-bold mt-1">
                                {t.price === '0' ? 'Free' : `₨${t.price}`}
                            </p>
                            {t.price !== '0' && <p className="text-[10px] text-text-dim">/month</p>}
                            <div className="mt-3">
                                {t.price === '0' ? (
                                    <span className="text-xs text-text-dim">Current</span>
                                ) : (
                                    <NeonButton size="sm" className="text-[10px] w-full" variant={t.highlight ? 'primary' : 'ghost'}>
                                        Subscribe
                                    </NeonButton>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feature comparison */}
                <div className="rounded-xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                    <div className="grid grid-cols-4 px-3 py-2 text-[10px] font-semibold text-text-dim" style={{ borderBottom: '1px solid #1F1F1F' }}>
                        <span>Feature</span>
                        <span className="text-center">Free</span>
                        <span className="text-center text-purple">Basic</span>
                        <span className="text-center text-yellow">Elite</span>
                    </div>
                    {features.map((f, i) => (
                        <div key={i} className="grid grid-cols-4 px-3 py-2.5 items-center text-xs" style={{ borderBottom: '1px solid #1F1F1F' }}>
                            <span className="text-text-secondary">{f.name}</span>
                            <span className="text-center">{typeof f.free === 'boolean' ? (f.free ? <Check size={14} className="text-green mx-auto" /> : <X size={14} className="text-text-dim mx-auto" />) : f.free}</span>
                            <span className="text-center">{typeof f.basic === 'boolean' ? (f.basic ? <Check size={14} className="text-green mx-auto" /> : <X size={14} className="text-text-dim mx-auto" />) : <span className="text-purple">{f.basic}</span>}</span>
                            <span className="text-center">{typeof f.elite === 'boolean' ? (f.elite ? <Check size={14} className="text-green mx-auto" /> : <X size={14} className="text-text-dim mx-auto" />) : <span className="text-yellow">{f.elite}</span>}</span>
                        </div>
                    ))}
                </div>

                {/* Society PRO */}
                <div className="mt-6 p-4 rounded-xl text-center" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                    <h3 className="font-heading font-semibold mb-1">PRO Society — ₨999/mo</h3>
                    <p className="text-xs text-text-secondary">For official society accounts. Verified badge, analytics, event tools & more.</p>
                </div>
            </div>
        </ScreenTransition>
    );
}
