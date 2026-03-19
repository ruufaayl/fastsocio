/** Auth layout — wraps login, register, and onboarding without bottom nav */
import MobileContainer from '@/components/layout/MobileContainer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <MobileContainer noPadding>{children}</MobileContainer>;
}
