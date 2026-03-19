'use client';
/** Mobile container — centers content at 430px max width with dark surround */
import { ReactNode } from 'react';

interface MobileContainerProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function MobileContainer({ children, className = '', noPadding }: MobileContainerProps) {
    return (
        <div className="min-h-screen" style={{ background: '#080808' }}>
            <div className={`relative mx-auto w-full max-w-[430px] min-h-screen ${noPadding ? '' : 'pb-20'} ${className}`}
                style={{ background: '#0D0D0D' }}>
                {children}
            </div>
        </div>
    );
}
