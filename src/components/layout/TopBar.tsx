'use client';
/** Top bar — live aura from auraStore, unread from notificationStore */
import Link from 'next/link';
import { Bell, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '@/store/auraStore';
import { useNotificationStore } from '@/store/notificationStore';
import { formatAura } from '@/lib/utils';

interface TopBarProps {
    title?: string;
    showBack?: boolean;
    backHref?: string;
}

export default function TopBar({ title, showBack, backHref = '/feed' }: TopBarProps) {
    const totalAura = useAuraStore((s) => s.totalAura);
    const unreadCount = useNotificationStore((s) => s.unreadCount);

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 max-w-[430px] mx-auto"
            style={{ background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-3">
                {showBack ? (
                    <Link href={backHref} className="text-text-secondary hover:text-text-primary transition-colors">
                        <ArrowLeft size={22} />
                    </Link>
                ) : null}
                {title ? (
                    <h1 className="text-lg font-semibold font-heading">{title}</h1>
                ) : (
                    <Link href="/feed" className="font-heading text-xl font-bold">
                        <span className="aura-gradient">FAST</span>
                        <span className="text-text-primary">SOCIO</span>
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Aura Chip — live from store */}
                <motion.div
                    key={totalAura}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
                >
                    <span className="text-xs">✨</span>
                    <span className="text-sm font-semibold text-purple">{formatAura(totalAura)}</span>
                </motion.div>

                {/* Notification Bell — live from store */}
                <Link href="/notifications" className="relative p-1">
                    <Bell size={22} className="text-text-secondary hover:text-text-primary transition-colors" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>
        </header>
    );
}
