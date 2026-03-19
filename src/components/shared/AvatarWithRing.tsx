'use client';
/** Avatar with animated aura-level ring */
import { cn } from '@/lib/utils';
import { getAuraColor } from '@/lib/aura-engine';

interface AvatarWithRingProps {
    src: string;
    alt: string;
    size?: number;
    auraScore?: number;
    isStory?: boolean;
    className?: string;
}

export default function AvatarWithRing({ src, alt, size = 44, auraScore = 0, isStory, className }: AvatarWithRingProps) {
    const ringColor = getAuraColor(auraScore);
    const ringSize = size + 6;

    return (
        <div className={cn('relative flex-shrink-0', className)} style={{ width: ringSize, height: ringSize }}>
            {/* Aura ring */}
            <div
                className={cn('absolute inset-0 rounded-full', isStory && 'animate-spin-slow')}
                style={{
                    background: `conic-gradient(${ringColor}, transparent 70%, ${ringColor})`,
                    padding: 2,
                }}
            >
                <div className="w-full h-full rounded-full" style={{ background: '#0D0D0D' }} />
            </div>
            {/* Avatar image */}
            <img
                src={src}
                alt={alt}
                className="absolute rounded-full object-cover"
                style={{ top: 3, left: 3, width: size, height: size, background: '#1A1A1A' }}
            />
        </div>
    );
}
