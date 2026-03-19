'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import NeonButton from '@/components/shared/NeonButton';
import { pageTransition } from '@/lib/design-system';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (val: string) => {
        if (val && !val.endsWith('@isb.nu.edu.pk') && !val.endsWith('@nu.edu.pk')) {
            setError('Only @isb.nu.edu.pk emails are allowed');
        } else {
            setError('');
        }
    };

    const handleLogin = async () => {
        setError('');

        if (!email.endsWith('@isb.nu.edu.pk') && !email.endsWith('@nu.edu.pk')) {
            setError('Only @isb.nu.edu.pk emails are allowed');
            return;
        }

        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (data?.session) {
                // Force a hard navigation so middleware picks up the new cookie
                window.location.href = '/feed';
            } else {
                setError('Login failed — no session returned');
                setLoading(false);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
            setLoading(false);
        }
    };

    return (
        <motion.div {...pageTransition} className="min-h-screen flex flex-col justify-center px-8">
            {/* Logo */}
            <div className="text-center mb-10">
                <h1 className="font-heading text-3xl font-bold mb-1">
                    <span className="aura-gradient">FAST</span><span>SOCIO</span>
                </h1>
                <p className="text-text-dim text-xs">Welcome back to the game</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <div>
                    <input
                        type="email"
                        placeholder="University email (@isb.nu.edu.pk)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => validateEmail(email)}
                        className="input-dark"
                        disabled={loading}
                    />
                </div>

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="input-dark"
                    disabled={loading}
                />

                {error && <p className="text-red text-xs mt-1.5 ml-1">{error}</p>}

                <NeonButton fullWidth onClick={handleLogin} disabled={loading}>
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Signing in...
                        </span>
                    ) : (
                        'Sign In'
                    )}
                </NeonButton>

                <button className="w-full text-center text-xs text-text-dim hover:text-orange transition-colors py-2">
                    Forgot password?
                </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-text-secondary mt-8">
                New to FASTSOCIO?{' '}
                <Link href="/register" className="font-semibold hover:underline" style={{ color: '#F97316' }}>Join</Link>
            </p>
        </motion.div>
    );
}
