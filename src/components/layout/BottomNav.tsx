'use client';
/** Bottom navigation bar — 6 tabs with active neon underline */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Trophy, MessageCircle, User, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/discover', icon: Compass, label: 'Discover' },
    { href: '/whiteboard', icon: Clipboard, label: 'Board' },
    { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/profile', icon: User, label: 'Me' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
            style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #1F1F1F' }}>
            <div className="flex items-center justify-around py-2">
                {tabs.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || pathname?.startsWith(href + '/');
                    return (
                        <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2 py-1 relative group">
                            <Icon size={20} className={cn('transition-colors', active ? 'text-purple' : 'text-text-dim group-hover:text-text-secondary')} />
                            <span className={cn('text-[9px] font-medium transition-colors', active ? 'text-purple' : 'text-text-dim')}>
                                {label}
                            </span>
                            {active && (
                                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-purple shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
