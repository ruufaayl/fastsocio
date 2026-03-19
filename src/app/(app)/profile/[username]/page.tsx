'use client';
/** Other user profile page */
import { use } from 'react';
import { FAKE_USERS } from '@/lib/fake-data';
import ScreenTransition from '@/components/layout/ScreenTransition';
import TopBar from '@/components/layout/TopBar';
import AvatarWithRing from '@/components/shared/AvatarWithRing';
import AuraBadge from '@/components/aura/AuraBadge';
import AuraRadarChart from '@/components/aura/AuraRadarChart';
import GlassCard from '@/components/shared/GlassCard';
import NeonButton from '@/components/shared/NeonButton';
import { getArchetypeInfo } from '@/lib/aura-engine';

export default function OtherProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const user = FAKE_USERS.find(u => u.handle === username) || FAKE_USERS[1];
    const arch = getArchetypeInfo(user.archetype);

    return (
        <ScreenTransition>
            <TopBar title={user.displayName} showBack backHref="/discover" />
            <div className="h-28" style={{ background: `linear-gradient(135deg, ${user.level.color}40, ${arch.color}30, #0D0D0D)` }} />
            <div className="px-4 -mt-8">
                <div className="flex items-end gap-3 mb-3">
                    <AvatarWithRing src={user.avatarUrl} alt={user.displayName} size={70} auraScore={user.totalAura} />
                    <div className="pb-1 flex-1">
                        <h1 className="font-heading text-lg font-bold">{user.displayName}</h1>
                        <p className="text-xs text-text-secondary">@{user.handle} · {user.department} {user.semester} Sem</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <AuraBadge score={user.totalAura} size="md" />
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${arch.color}20`, color: arch.color }}>{arch.icon} {arch.name}</span>
                </div>
                <p className="text-sm mb-4">{user.bio}</p>
                <div className="flex gap-2 mb-4">
                    <NeonButton size="sm" className="flex-1">Connect 💜</NeonButton>
                    <NeonButton variant="ghost" size="sm" className="flex-1">Message</NeonButton>
                </div>
                <GlassCard className="mb-4">
                    <AuraRadarChart stats={user.auraStats} size={160} />
                </GlassCard>
                <div className="grid grid-cols-4 gap-2 text-center">
                    {[{ l: 'Connections', v: user.connections }, { l: 'Followers', v: user.followers }, { l: 'Following', v: user.following }, { l: 'Posts', v: user.posts }].map(s => (
                        <div key={s.l} className="py-2 rounded-xl" style={{ background: '#1A1A1A' }}>
                            <div className="font-semibold text-sm">{s.v}</div>
                            <div className="text-[10px] text-text-dim">{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>
        </ScreenTransition>
    );
}
