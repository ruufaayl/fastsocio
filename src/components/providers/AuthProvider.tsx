'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const PUBLIC_PATHS = ['/', '/login', '/register'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const loadSession = useAuthStore((s) => s.loadSession);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const setUser = useAuthStore((s) => s.setUser);
    const setLoading = useAuthStore((s) => s.setLoading);

    // Load session once on mount
    useEffect(() => {
        loadSession();
    }, [loadSession]);

    // Listen for auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*, departments:department_id(code, name, color, icon), degrees:degree_id(code, name)')
                        .eq('id', session.user.id)
                        .single();
                    setUser(profile);
                } catch {
                    // Profile fetch failed but user is still authenticated
                    setUser({ id: session.user.id, email: session.user.email });
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [setUser, setLoading]);

    // Route protection
    useEffect(() => {
        if (isLoading) return; // Wait for session to load

        const isPublic = PUBLIC_PATHS.includes(pathname);
        const isOnboarding = pathname === '/onboarding';

        if (!isAuthenticated && !isPublic && !isOnboarding) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show nothing while loading session (prevents flash)
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0D' }}>
                <div className="text-center">
                    <h1 className="font-heading text-2xl font-bold mb-2">
                        <span className="aura-gradient">FAST</span><span className="text-white">SOCIO</span>
                    </h1>
                    <div className="w-6 h-6 border-2 border-purple border-t-transparent rounded-full animate-spin mx-auto mt-4" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
