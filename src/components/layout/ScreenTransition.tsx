'use client';
/** Screen transition wrapper using Framer Motion */
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransition } from '@/lib/design-system';

interface ScreenTransitionProps {
    children: ReactNode;
    className?: string;
}

export default function ScreenTransition({ children, className = '' }: ScreenTransitionProps) {
    return (
        <motion.div
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            className={className}
        >
            {children}
        </motion.div>
    );
}
