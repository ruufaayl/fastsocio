'use client';
/** Leaderboard row — stock ticker style with rank, name, aura, change arrow, sparkline */
import AvatarWithRing from '@/components/shared/AvatarWithRing';
import AuraBadge from '@/components/aura/AuraBadge';
import { formatAura } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/aura';

interface LeaderboardRowProps { entry: LeaderboardEntry; isCurrentUser?: boolean; }

function MiniSparkline({ data }: { data: number[] }) {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 50, h = 20;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <polyline points={points} fill="none" stroke="#A855F7" strokeWidth={1.5} />
        </svg>
    );
}

export default function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
    const isPositive = entry.change24h >= 0;
    return (
        <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${isCurrentUser ? 'bg-purple/5 border-l-2 border-purple' : 'hover:bg-bg-elevated/50'}`}
            style={{ borderBottom: '1px solid #1F1F1F' }}>
            {/* Rank */}
            <div className="w-7 text-center">
                {entry.rank <= 3 ? (
                    <span className="text-lg">{entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}</span>
                ) : (
                    <span className="text-sm font-semibold text-text-dim">#{entry.rank}</span>
                )}
            </div>

            <AvatarWithRing src={entry.userAvatar} alt={entry.userName} size={36} auraScore={entry.score} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{entry.userName}</span>
                    <span className="text-[10px] text-text-dim">{entry.userDepartment}</span>
                </div>
                <span className="text-[10px] text-text-dim">{entry.archetype}</span>
            </div>

            <MiniSparkline data={entry.sparkline} />

            <div className="text-right min-w-[60px]">
                <div className="font-semibold text-sm">{formatAura(entry.score)}</div>
                <div className={`text-[10px] font-medium ${isPositive ? 'text-green' : 'text-red'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(entry.change24h)}
                </div>
            </div>
        </div>
    );
}
