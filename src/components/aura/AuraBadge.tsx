'use client';
/** Aura level badge — the small pill showing your level */
import { getAuraLevel } from '@/lib/aura-engine';

interface AuraBadgeProps {
    score: number;
    size?: 'sm' | 'md';
}

export default function AuraBadge({ score, size = 'sm' }: AuraBadgeProps) {
    const level = getAuraLevel(score);
    return (
        <span
            className="badge-aura"
            style={{
                background: `${level.color}20`,
                color: level.color,
                border: `1px solid ${level.color}40`,
                fontSize: size === 'sm' ? 10 : 12,
                padding: size === 'sm' ? '2px 8px' : '4px 10px',
            }}
        >
            {level.icon} {level.name}
        </span>
    );
}
