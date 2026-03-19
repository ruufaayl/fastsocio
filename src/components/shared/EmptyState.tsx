'use client';
/** Empty state component for pages with no data */
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <span className="text-5xl mb-4">{icon}</span>
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-[280px]">{description}</p>
            {action}
        </div>
    );
}
