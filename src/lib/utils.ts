import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx for conditional + deduplication */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format large numbers with K suffix */
export function formatAura(value: number): string {
    if (value >= 10000) return `${(value / 1000).toFixed(1)}K`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
}

/** Get time ago string from a date */
export function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

/** Truncate text with ellipsis */
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

/** Generate initials from a name */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/** Random integer between min and max inclusive */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
