'use client';
/** Neon purple pill button with glow effect */
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NeonButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    fullWidth?: boolean;
}

export default function NeonButton({ children, onClick, variant = 'primary', size = 'md', className, disabled, fullWidth }: NeonButtonProps) {
    const baseClass = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-ghost';
    const sizeClass = size === 'sm' ? 'text-xs px-4 py-2' : size === 'lg' ? 'text-base px-8 py-3.5' : '';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(baseClass, sizeClass, fullWidth && 'w-full', disabled && 'opacity-50 cursor-not-allowed', className)}
        >
            {children}
        </button>
    );
}
