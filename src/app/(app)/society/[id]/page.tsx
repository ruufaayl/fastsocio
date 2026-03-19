'use client';
/** Society detail page — official society with events, members, and collective aura */
import { use } from 'react';
import { Users, Calendar, Trophy } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import GlassCard from '@/components/shared/GlassCard';
import NeonButton from '@/components/shared/NeonButton';
import { FAKE_SOCIETIES, FAKE_USERS } from '@/lib/fake-data';
import { formatAura } from '@/lib/utils';

export default function SocietyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const society = FAKE_SOCIETIES.find(s => s.id === id) || FAKE_SOCIETIES[0];
    const pres = FAKE_USERS.find(u => u.id === society.presidentId);

    return (
        <ScreenTransition>
            <TopBar title={society.shortName} showBack backHref="/rooms" />

            {/* Cover */}
            <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${society.coverUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
            </div>

            <div className="px-4 -mt-8 relative">
                {/* Logo + Name */}
                <div className="flex items-end gap-3 mb-3">
                    <img src={society.logoUrl} alt={society.name} className="w-16 h-16 rounded-xl" style={{ background: '#1A1A1A', border: '2px solid #2A2A2A' }} />
                    <div className="pb-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-heading text-lg font-bold">{society.name}</h1>
                            {society.isVerified && <span>✅</span>}
                        </div>
                        <p className="text-xs text-text-secondary">{society.description}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <GlassCard className="text-center py-3">
                        <Users size={16} className="text-purple mx-auto mb-1" />
                        <div className="font-semibold text-sm">{society.memberCount}</div>
                        <div className="text-[10px] text-text-dim">Members</div>
                    </GlassCard>
                    <GlassCard className="text-center py-3">
                        <span className="text-lg block mb-1">✨</span>
                        <div className="font-semibold text-sm text-purple">{formatAura(society.collectiveAura)}</div>
                        <div className="text-[10px] text-text-dim">Collective Aura</div>
                    </GlassCard>
                    <GlassCard className="text-center py-3">
                        <Trophy size={16} className="text-yellow mx-auto mb-1" />
                        <div className="font-semibold text-sm">#2</div>
                        <div className="text-[10px] text-text-dim">Aura Cup Rank</div>
                    </GlassCard>
                </div>

                {/* President */}
                {pres && (
                    <GlassCard className="mb-4">
                        <p className="text-xs text-text-dim mb-2">President</p>
                        <div className="flex items-center gap-3">
                            <img src={pres.avatarUrl} alt={pres.displayName} className="w-10 h-10 rounded-full" style={{ background: '#1A1A1A' }} />
                            <div>
                                <p className="font-semibold text-sm">{pres.displayName}</p>
                                <p className="text-xs text-text-dim">@{pres.handle}</p>
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Join */}
                <NeonButton fullWidth className="mb-4">
                    {society.joinStatus === 'open' ? 'Join Society' : society.joinStatus === 'applicationRequired' ? 'Apply to Join' : 'Invite Only'} +50 aura
                </NeonButton>

                {/* Upcoming events placeholder */}
                <GlassCard className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-purple" />
                        <h3 className="font-heading text-sm font-semibold">Upcoming Events</h3>
                    </div>
                    <div className="py-4 text-center text-xs text-text-dim">
                        No upcoming events — stay tuned! 🗓️
                    </div>
                </GlassCard>
            </div>
        </ScreenTransition>
    );
}
