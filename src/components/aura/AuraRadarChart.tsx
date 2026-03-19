'use client';
/** SVG Radar Chart showing the 4 aura stat dimensions */
import type { AuraStats } from '@/types/user';

interface AuraRadarChartProps {
    stats: AuraStats;
    size?: number;
}

const LABELS = [
    { key: 'social' as const, label: '💜 Social', angle: -90 },
    { key: 'content' as const, label: '🔥 Content', angle: 0 },
    { key: 'campus' as const, label: '📍 Campus', angle: 90 },
    { key: 'wisdom' as const, label: '🧠 Wisdom', angle: 180 },
];

export default function AuraRadarChart({ stats, size = 200 }: AuraRadarChartProps) {
    const cx = size / 2;
    const cy = size / 2;
    const maxVal = Math.max(stats.social, stats.content, stats.campus, stats.wisdom, 1000);
    const r = (size / 2) - 30;

    function getPoint(angle: number, value: number) {
        const rad = (angle * Math.PI) / 180;
        const ratio = Math.min(value / maxVal, 1);
        return { x: cx + r * ratio * Math.cos(rad), y: cy + r * ratio * Math.sin(rad) };
    }

    const points = LABELS.map(l => getPoint(l.angle, stats[l.key]));
    const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            {/* Grid rings */}
            {[0.25, 0.5, 0.75, 1].map(ratio => (
                <polygon
                    key={ratio}
                    points={LABELS.map(l => {
                        const p = getPoint(l.angle, maxVal * ratio);
                        return `${p.x},${p.y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#2A2A2A"
                    strokeWidth={1}
                />
            ))}
            {/* Axis lines */}
            {LABELS.map(l => {
                const p = getPoint(l.angle, maxVal);
                return <line key={l.key} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2A2A2A" strokeWidth={1} />;
            })}
            {/* Data polygon */}
            <polygon points={polygon} fill="rgba(168,85,247,0.2)" stroke="#A855F7" strokeWidth={2} />
            {/* Data dots */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="#A855F7" />
            ))}
            {/* Labels */}
            {LABELS.map(l => {
                const p = getPoint(l.angle, maxVal * 1.25);
                return (
                    <text key={l.key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                        fill="#888" fontSize={11} fontFamily="Space Grotesk">
                        {l.label}
                    </text>
                );
            })}
        </svg>
    );
}
