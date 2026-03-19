'use client';
/** Chat page — real Supabase connections, only matched users can chat */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import AvatarWithRing from '@/components/shared/AvatarWithRing';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';

interface ChatConversation {
    id: string;
    connected_user_id: string;
    tier: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
    connected_profile: {
        id: string;
        handle: string;
        display_name: string;
        avatar_url: string | null;
        total_aura: number;
        last_active: string;
    };
}

export default function ChatPage() {
    const user = useAuthStore((s) => s.user);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        async function loadConversations() {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('connections')
                    .select(`
                        id, connected_user_id, tier, last_message, last_message_at, unread_count,
                        connected_profile:connected_user_id(id, handle, display_name, avatar_url, total_aura, last_active)
                    `)
                    .eq('user_id', user!.id)
                    .order('last_message_at', { ascending: false, nullsFirst: false });

                if (error) throw error;
                setConversations((data || []) as unknown as ChatConversation[]);
            } catch (err) {
                console.error('Failed to load conversations:', err);
            }
            setIsLoading(false);
        }

        loadConversations();

        // Realtime subscription for new messages
        const channel = supabase
            .channel(`chat-list:${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'connections',
                filter: `user_id=eq.${user.id}`,
            }, () => {
                loadConversations();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user?.id]);

    return (
        <ScreenTransition>
            <TopBar title="Messages" />

            {/* Mutual match info */}
            <div className="px-4 mb-3">
                <div className="px-3 py-2 rounded-lg text-xs text-text-secondary flex items-center gap-2"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <MessageCircle size={14} className="text-purple flex-shrink-0" />
                    <span>Chat unlocks when both users like each other on Discover</span>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="text-purple animate-spin" />
                </div>
            ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                    <span className="text-5xl mb-4">💬</span>
                    <h3 className="font-heading text-lg font-bold mb-2">No conversations yet</h3>
                    <p className="text-sm text-text-secondary mb-4">
                        Match with someone on Discover to start chatting!
                    </p>
                    <Link href="/discover" className="btn-primary px-6 py-2.5 text-sm">
                        Go to Discover
                    </Link>
                </div>
            ) : (
                <div>
                    {conversations.map(c => {
                        const profile = c.connected_profile;
                        if (!profile) return null;

                        return (
                            <Link key={c.id} href={`/chat/${c.connected_user_id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated/30 transition-colors"
                                style={{ borderBottom: '1px solid #1F1F1F' }}>
                                <AvatarWithRing
                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.handle}`}
                                    alt={profile.display_name}
                                    size={44}
                                    auraScore={profile.total_aura}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{profile.display_name}</span>
                                            {c.tier === 'closeCircle' && <span className="text-[10px]">💫</span>}
                                            {c.tier === 'innerCircle' && <span className="text-[10px]">👑</span>}
                                        </div>
                                        {c.last_message_at && (
                                            <span className="text-[10px] text-text-dim">{timeAgo(new Date(c.last_message_at))}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-secondary truncate">
                                        {c.last_message || 'Say hello! 👋'}
                                    </p>
                                </div>
                                {c.unread_count > 0 && (
                                    <span className="w-5 h-5 bg-purple rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {c.unread_count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </ScreenTransition>
    );
}
