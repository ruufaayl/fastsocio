'use client';
/** Glassmorphism card component */
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    padding?: boolean;
}

export default function GlassCard({ children, className, onClick, padding = true }: GlassCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn('card-glass transition-all duration-200', padding && 'p-4', onClick && 'cursor-pointer hover:border-purple/20', className)}
        >
            {children}
        </div>
    );
}
