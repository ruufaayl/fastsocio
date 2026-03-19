'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import NeonButton from '@/components/shared/NeonButton';
import { pageTransition } from '@/lib/design-system';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [handle, setHandle] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [handleChecking, setHandleChecking] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

    const checkHandle = async (value: string) => {
        if (!value || value.length < 3) {
            setHandleAvailable(null);
            return;
        }

        setHandleChecking(true);
        try {
            const { data, error: queryError } = await supabase
                .from('profiles')
                .select('handle')
                .eq('handle', value.toLowerCase())
                .maybeSingle();

            if (queryError) {
                setHandleAvailable(null);
                return;
            }

            setHandleAvailable(!data);
        } catch {
            setHandleAvailable(null);
        } finally {
            setHandleChecking(false);
        }
    };

    const handleRegister = async () => {
        setError('');

        if (!email.endsWith('@isb.nu.edu.pk')) {
            setError('Only @isb.nu.edu.pk emails allowed');
            return;
        }
        if (!displayName.trim()) {
            setError('Display name is required');
            return;
        }
        if (!handle.trim() || handle.length < 3) {
            setError('Handle must be at least 3 characters');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
            setError('Handle can only contain letters, numbers, and underscores');
            return;
        }
        if (handleAvailable === false) {
            setError('Handle is already taken');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);

            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (!authData.user) {
                setError('Registration failed. Please try again.');
                return;
            }

            // The handle_new_user() trigger auto-creates a profile row.
            // Update it with the user's chosen display name and handle.
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName.trim(),
                    handle: handle.toLowerCase().trim(),
                })
                .eq('id', authData.user.id);

            if (profileError) {
                setError(profileError.message);
                return;
            }

            router.push('/onboarding');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div {...pageTransition} className="min-h-screen flex flex-col justify-center px-8 py-12">
            <div className="text-center mb-10">
                <h1 className="font-heading text-3xl font-bold mb-1">
                    <span className="aura-gradient">Join</span> <span>FASTSOCIO</span>
                </h1>
                <p className="text-text-dim text-xs">Your aura journey starts here</p>
            </div>

            <div className="space-y-4">
                <input
                    type="email"
                    placeholder="University email (@isb.nu.edu.pk)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark"
                    disabled={loading}
                />

                <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-dark"
                    disabled={loading}
                />

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Handle (e.g. ahmed_cs)"
                        value={handle}
                        onChange={(e) => {
                            const v = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                            setHandle(v);
                            setHandleAvailable(null);
                        }}
                        onBlur={() => checkHandle(handle)}
                        className="input-dark"
                        disabled={loading}
                    />
                    {handleChecking && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim text-xs">Checking...</span>
                    )}
                    {!handleChecking && handleAvailable === true && handle.length >= 3 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green text-xs">Available</span>
                    )}
                    {!handleChecking && handleAvailable === false && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red text-xs">Taken</span>
                    )}
                </div>

                <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark"
                    disabled={loading}
                />

                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    className="input-dark"
                    disabled={loading}
                />

                {error && <p className="text-red text-xs ml-1">{error}</p>}

                <NeonButton fullWidth onClick={handleRegister} disabled={loading}>
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating Account...
                        </span>
                    ) : (
                        'Create Account'
                    )}
                </NeonButton>
            </div>

            <p className="text-center text-sm text-text-secondary mt-8">
                Already a member?{' '}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: '#F97316' }}>Sign In</Link>
            </p>
        </motion.div>
    );
}
