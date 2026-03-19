'use client';
/** Animated aura counter that counts up to the target value */
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { formatAura } from '@/lib/utils';

interface AuraCounterProps {
    value: number;
    className?: string;
}

export default function AuraCounter({ value, className = '' }: AuraCounterProps) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const start = display;
        const duration = 1200;
        const startTime = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + (value - start) * eased));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [value]);

    return (
        <span className={`font-heading font-bold tabular-nums ${className}`}>
            {formatAura(display)}
        </span>
    );
}
