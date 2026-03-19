'use client';
/** Rooms page — real Supabase data with proper edge case handling */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2, Lock } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import NeonButton from '@/components/shared/NeonButton';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface RoomData {
    id: string;
    name: string;
    description: string | null;
    type: string;
    icon: string;
    member_count: number;
    is_verified: boolean;
    is_popular: boolean;
    is_featured: boolean;
    has_passcode: boolean;
    tags: string[];
    last_activity_at: string;
    expires_at: string | null;
}

const TABS = [
    { id: 'all', label: '🌐 All' },
    { id: 'official', label: '✅ Official' },
    { id: 'community', label: '🏠 Community' },
    { id: 'joined', label: '⭐ Joined' },
];

export default function RoomsPage() {
    const user = useAuthStore((s) => s.user);
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [joinedRoomIds, setJoinedRoomIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    useEffect(() => {
        loadRooms();
    }, [user?.id]);

    async function loadRooms() {
        setIsLoading(true);
        try {
            // Load all rooms (exclude expired ones)
            const { data: roomData, error } = await supabase
                .from('rooms')
                .select('*')
                .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
                .order('last_activity_at', { ascending: false });
            if (error) throw error;
            setRooms(roomData || []);

            // Load joined rooms
            if (user?.id) {
                const { data: memberData } = await supabase
                    .from('room_members')
                    .select('room_id')
                    .eq('user_id', user.id);
                setJoinedRoomIds(new Set(memberData?.map(m => m.room_id) || []));
            }
        } catch (err) {
            console.error('Failed to load rooms:', err);
        }
        setIsLoading(false);
    }

    async function handleJoin(roomId: string, hasPasscode: boolean) {
        if (!user?.id) return;
        if (hasPasscode) {
            // TODO: Show passcode modal
            return;
        }

        setJoiningId(roomId);
        try {
            const { error } = await supabase
                .from('room_members')
                .insert({ room_id: roomId, user_id: user.id });
            if (error) {
                if (error.code === '23505') {
                    // Already a member, ignore
                } else throw error;
            }
            setJoinedRoomIds(prev => new Set([...prev, roomId]));
        } catch (err) {
            console.error('Failed to join room:', err);
        }
        setJoiningId(null);
    }

    async function handleLeave(roomId: string) {
        if (!user?.id) return;
        setJoiningId(roomId);
        try {
            await supabase.from('room_members').delete().eq('room_id', roomId).eq('user_id', user.id);
            setJoinedRoomIds(prev => {
                const next = new Set(prev);
                next.delete(roomId);
                return next;
            });
        } catch (err) {
            console.error('Failed to leave room:', err);
        }
        setJoiningId(null);
    }

    const filtered = rooms.filter(r => {
        if (tab === 'joined') return joinedRoomIds.has(r.id);
        if (tab === 'official') return r.type === 'official';
        if (tab === 'community') return r.type === 'community';
        // 'all' shows everything
        return true;
    }).filter(r => {
        if (!search) return true;
        return r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    });

    return (
        <ScreenTransition>
            <TopBar title="Rooms" showBack backHref="/feed" />

            <div className="px-4 py-2">
                {/* Search */}
                <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input type="text" placeholder="Search rooms or tags..." value={search} onChange={e => setSearch(e.target.value)}
                        className="input-dark pl-10" />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-4">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className="flex-1 py-2 text-xs font-medium rounded-full transition-all"
                            style={{ background: tab === t.id ? 'rgba(168,85,247,0.1)' : 'transparent', color: tab === t.id ? '#A855F7' : '#555' }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Room list */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="text-purple animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(r => {
                            const isMember = joinedRoomIds.has(r.id);
                            return (
                                <div key={r.id} className="p-4 rounded-xl transition-colors" style={{ background: '#1A1A1A', border: `1px solid ${r.is_featured ? 'rgba(168,85,247,0.3)' : '#1F1F1F'}` }}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{r.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/rooms/${r.id}`} className="font-semibold text-sm hover:text-purple transition-colors">{r.name}</Link>
                                                {r.is_verified && <span className="text-xs">✅</span>}
                                                {r.is_popular && <span className="text-[10px] text-yellow">🔥</span>}
                                                {r.has_passcode && <Lock size={10} className="text-text-dim" />}
                                            </div>
                                            {r.description && (
                                                <p className="text-xs text-text-dim truncate">{r.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-text-dim">{r.member_count} members</span>
                                                {r.tags?.length > 0 && (
                                                    <span className="text-[10px] text-text-dim">{r.tags.slice(0, 3).join(' · ')}</span>
                                                )}
                                            </div>
                                        </div>
                                        {isMember ? (
                                            <div className="flex items-center gap-2">
                                                <Link href={`/rooms/${r.id}`}>
                                                    <NeonButton size="sm" className="text-xs">Open</NeonButton>
                                                </Link>
                                                <button onClick={() => handleLeave(r.id)}
                                                    className="text-[10px] text-text-dim hover:text-red transition-colors">
                                                    {joiningId === r.id ? '...' : 'Leave'}
                                                </button>
                                            </div>
                                        ) : (
                                            <NeonButton size="sm" className="text-xs"
                                                onClick={(e: React.MouseEvent) => { e.preventDefault(); handleJoin(r.id, r.has_passcode); }}
                                                disabled={joiningId === r.id}>
                                                {joiningId === r.id ? '...' : r.has_passcode ? '🔒 Join' : 'Join'}
                                            </NeonButton>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div className="text-center py-8">
                                <span className="text-3xl block mb-2">{tab === 'joined' ? '⭐' : '🏠'}</span>
                                <p className="text-sm text-text-secondary">
                                    {tab === 'joined' ? "You haven't joined any rooms yet" : search ? 'No rooms match your search' : 'No rooms found'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Create room */}
                <div className="mt-4 flex justify-center">
                    <NeonButton variant="ghost" size="sm" className="flex items-center gap-2">
                        <Plus size={14} /> Create Room
                    </NeonButton>
                </div>
            </div>
        </ScreenTransition>
    );
}
