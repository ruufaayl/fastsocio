'use client';
/** Notifications page — wired to notificationStore */
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import NeonButton from '@/components/shared/NeonButton';
import { useNotificationStore } from '@/store/notificationStore';
import { timeAgo } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/design-system';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
    const router = useRouter();

    const unread = notifications.filter((n) => !n.isRead);
    const read = notifications.filter((n) => n.isRead);

    const handleTap = (notif: (typeof notifications)[0]) => {
        markRead(notif.id);
        if (notif.actionUrl) router.push(notif.actionUrl);
    };

    return (
        <ScreenTransition>
            <TopBar title="Notifications" showBack backHref="/feed" />

            <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-text-dim">{unreadCount} unread</span>
                    <NeonButton variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>Mark all read</NeonButton>
                </div>

                {unread.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">New</h3>
                        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-1">
                            {unread.map((n) => (
                                <motion.div key={n.id} variants={staggerItem}>
                                    <button onClick={() => handleTap(n)} className="w-full text-left">
                                        <NotifRow notif={n} />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                )}

                <div>
                    <h3 className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">Earlier</h3>
                    <div className="space-y-1">
                        {read.map((n) => (
                            <button key={n.id} onClick={() => handleTap(n)} className="w-full text-left">
                                <NotifRow notif={n} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </ScreenTransition>
    );
}

function NotifRow({ notif }: { notif: { id: string; emoji: string; title: string; message: string; isRead: boolean; createdAt: Date; auraImpact?: number } }) {
    return (
        <div className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-colors ${!notif.isRead ? 'bg-purple/5' : 'hover:bg-bg-elevated/30'}`}
            style={{ border: !notif.isRead ? '1px solid rgba(168,85,247,0.1)' : '1px solid transparent' }}>
            <span className="text-xl flex-shrink-0">{notif.emoji}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notif.title}</p>
                <p className="text-xs text-text-secondary">{notif.message}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-dim">{timeAgo(notif.createdAt)}</span>
                    {notif.auraImpact !== undefined && notif.auraImpact > 0 && (
                        <span className="text-[10px] font-semibold text-purple">+{notif.auraImpact} aura</span>
                    )}
                </div>
            </div>
        </div>
    );
}
