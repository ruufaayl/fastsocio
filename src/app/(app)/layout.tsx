'use client';
/** App layout — wraps all main app pages with BottomNav */
import BottomNav from '@/components/layout/BottomNav';
import MobileContainer from '@/components/layout/MobileContainer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <MobileContainer>
            {children}
            <BottomNav />
        </MobileContainer>
    );
}
