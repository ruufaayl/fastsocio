'use client';
/** Confetti burst animation for celebrations */
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ConfettiBlastProps {
    trigger: boolean;
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['#A855F7', '#F97316', '#FACC15', '#22C55E', '#3B82F6'][i % 5],
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 100),
    rotate: Math.random() * 720 - 360,
    scale: Math.random() * 0.5 + 0.5,
}));

export default function ConfettiBlast({ trigger }: ConfettiBlastProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (trigger) {
            setShow(true);
            const t = setTimeout(() => setShow(false), 1500);
            return () => clearTimeout(t);
        }
    }, [trigger]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center">
                    {PARTICLES.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                            animate={{ x: p.x, y: p.y, scale: p.scale, rotate: p.rotate, opacity: 0 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="absolute w-3 h-3 rounded-sm"
                            style={{ background: p.color }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}
