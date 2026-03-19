'use client';
/** Animated aura orb with pulsing glow */
import { motion } from 'framer-motion';

interface AuraOrbProps {
    size?: number;
    color?: string;
    score?: number;
}

export default function AuraOrb({ size = 80, color = '#A855F7', score }: AuraOrbProps) {
    return (
        <motion.div
            animate={{ boxShadow: [`0 0 20px ${color}40`, `0 0 40px ${color}60`, `0 0 20px ${color}40`] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-full flex items-center justify-center"
            style={{ width: size, height: size, background: `radial-gradient(circle, ${color}30 0%, ${color}10 60%, transparent 100%)`, border: `2px solid ${color}50` }}
        >
            {score !== undefined && (
                <span className="font-heading font-bold text-lg" style={{ color }}>{score}</span>
            )}
        </motion.div>
    );
}
