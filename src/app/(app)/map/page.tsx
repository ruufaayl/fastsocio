'use client';
/** Campus map page with schematic map and hotspot pins */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import GlassCard from '@/components/shared/GlassCard';
import NeonButton from '@/components/shared/NeonButton';
import { FAKE_HOTSPOTS } from '@/lib/fake-data';
import type { CampusHotspot } from '@/types/aura';

const crowdColors = { empty: '#22C55E', light: '#22C55E', moderate: '#FACC15', packed: '#EF4444' };
const crowdLabels = { empty: '🟢 Empty', light: '🟢 Light', moderate: '🟡 Moderate', packed: '🔴 Packed' };

export default function MapPage() {
    const [selected, setSelected] = useState<CampusHotspot | null>(null);

    return (
        <ScreenTransition>
            <TopBar title="Campus Map" />
            <div className="px-4 py-2">
                <p className="text-xs text-text-dim text-center mb-3">FAST-NUCES Islamabad • Live Activity</p>

                {/* Map container */}
                <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1.1', background: '#111', border: '1px solid #2A2A2A' }}>
                    {/* Grid pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-10">
                        {Array.from({ length: 10 }, (_, i) => (
                            <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#333" strokeWidth={0.5} />
                        ))}
                        {Array.from({ length: 10 }, (_, i) => (
                            <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#333" strokeWidth={0.5} />
                        ))}
                    </svg>

                    {/* Road paths */}
                    <svg className="absolute inset-0 w-full h-full">
                        <path d="M 50%,0 L 50%,100%" stroke="#1A1A1A" strokeWidth={8} fill="none" />
                        <path d="M 0,50% L 100%,50%" stroke="#1A1A1A" strokeWidth={8} fill="none" />
                    </svg>

                    {/* Hotspot pins */}
                    {FAKE_HOTSPOTS.map(h => (
                        <button key={h.id} onClick={() => setSelected(h)}
                            className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group z-10"
                            style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg transition-transform group-hover:scale-110"
                                    style={{ background: `${crowdColors[h.crowdLevel]}20`, border: `2px solid ${crowdColors[h.crowdLevel]}` }}>
                                    {h.type === 'cafeteria' ? '🍽️' : h.type === 'library' ? '📚' : h.type === 'ground' ? '⚽' : h.type === 'parking' ? '🅿️' : h.type === 'gate' ? '🚪' : h.type === 'admin' ? '🏛️' : '🏫'}
                                </div>
                                {h.ruler && <span className="absolute -top-1 -right-1 text-[10px]">👑</span>}
                            </div>
                            <span className="text-[9px] text-text-secondary mt-0.5 font-medium whitespace-nowrap">{h.name}</span>
                        </button>
                    ))}
                </div>

                {/* Check-in button */}
                <div className="mt-4 flex justify-center">
                    <NeonButton size="sm">📍 Check In</NeonButton>
                </div>
            </div>

            {/* Hotspot detail card */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[400px] max-w-[calc(100%-32px)] z-50">
                        <GlassCard>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-heading font-semibold text-lg">{selected.name}</h3>
                                <button onClick={() => setSelected(null)}><X size={18} className="text-text-dim" /></button>
                            </div>
                            <div className="flex items-center gap-3 text-xs mb-2">
                                <span>Crowd: {crowdLabels[selected.crowdLevel]}</span>
                                <span>Vibe: {'⭐'.repeat(Math.round(selected.vibeRating))}</span>
                            </div>
                            {selected.ruler && (
                                <div className="flex items-center gap-2 text-xs mb-2">
                                    <span>👑 Ruler:</span>
                                    <img src={selected.rulerAvatar} alt="" className="w-5 h-5 rounded-full" />
                                    <span className="text-purple font-medium">{selected.ruler}</span>
                                </div>
                            )}
                            {selected.recentReview && (
                                <p className="text-xs text-text-secondary italic">&quot;{selected.recentReview}&quot;</p>
                            )}
                            <p className="text-xs text-text-dim mt-2">{selected.checkInCount} check-ins today</p>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </ScreenTransition>
    );
}
