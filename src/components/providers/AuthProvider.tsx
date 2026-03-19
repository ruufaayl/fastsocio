'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const loadSession = useAuthStore((s) => s.loadSession);
    const setUser = useAuthStore((s) => s.setUser);
    const setLoading = useAuthStore((s) => s.setLoading);

    useEffect(() => {
        loadSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*, departments:department_id(code, name, color, icon), degrees:degree_id(code, name)')
                    .eq('id', session.user.id)
                    .single();
                setUser(profile);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [loadSession, setUser, setLoading]);

    return <>{children}</>;
}
