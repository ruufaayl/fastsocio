'use client';
/** Room detail page — 3 sub-tabs: Announcements, Discussion, Lounge */
import { use, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import { FAKE_ROOMS, FAKE_USERS } from '@/lib/fake-data';
import { Send } from 'lucide-react';

const fakeMsgs = [
    { id: '1', user: FAKE_USERS[7], text: 'next ACM meetup is on Thursday, dont forget your laptops', layer: 'announcements' as const },
    { id: '2', user: FAKE_USERS[0], text: 'anyone solved problem C from the last contest?', layer: 'discussion' as const },
    { id: '3', user: FAKE_USERS[3], text: 'yeah use binary search + segment tree combo', layer: 'discussion' as const },
    { id: '4', user: FAKE_USERS[1], text: 'lol the contest was brutal 💀', layer: 'lounge' as const },
    { id: '5', user: FAKE_USERS[4], text: 'who else is going to the competition on friday?', layer: 'discussion' as const },
];

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);
    const room = FAKE_ROOMS.find(r => r.id === roomId) || FAKE_ROOMS[0];
    const [layer, setLayer] = useState<'announcements' | 'discussion' | 'lounge'>('discussion');
    const [msg, setMsg] = useState('');

    const msgs = fakeMsgs.filter(m => m.layer === layer);

    return (
        <div className="flex flex-col h-screen max-w-[430px] mx-auto" style={{ background: '#0D0D0D' }}>
            <TopBar title={`${room.icon} ${room.name}`} showBack backHref="/rooms" />

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: '1px solid #1F1F1F' }}>
                {(['announcements', 'discussion', 'lounge'] as const).map(l => (
                    <button key={l} onClick={() => setLayer(l)}
                        className="flex-1 py-1.5 text-xs font-medium rounded-full transition-all capitalize"
                        style={{ background: layer === l ? 'rgba(168,85,247,0.1)' : 'transparent', color: layer === l ? '#A855F7' : '#555' }}>
                        {l === 'announcements' ? '📢' : l === 'discussion' ? '💬' : '☕'} {l}
                    </button>
                ))}
            </div>

            {/* Members + info */}
            <div className="px-4 py-2 text-xs text-text-dim flex items-center justify-between" style={{ borderBottom: '1px solid #1F1F1F' }}>
                <span>{room.memberCount} members</span>
                {room.isVerified && <span>✅ Official</span>}
                {layer === 'lounge' && <span className="text-yellow">Messages disappear in 24h</span>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
                {msgs.length === 0 ? (
                    <p className="text-center text-sm text-text-dim py-8">No messages in this layer yet</p>
                ) : msgs.map(m => (
                    <div key={m.id} className="flex gap-3">
                        <img src={m.user.avatarUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{m.user.displayName}</span>
                                <span className="text-[10px] text-text-dim">@{m.user.handle}</span>
                            </div>
                            <p className="text-sm text-text-secondary mt-0.5">{m.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Compose */}
            <div className="p-4 flex items-center gap-3" style={{ borderTop: '1px solid #1F1F1F' }}>
                <input type="text" placeholder={`Message ${layer}...`} value={msg} onChange={e => setMsg(e.target.value)} className="input-dark flex-1" />
                <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
                    <Send size={16} className="text-white" />
                </button>
            </div>
        </div>
    );
}
