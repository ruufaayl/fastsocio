'use client';
/** Chat thread — real message send, scroll to bottom, message composer */
import { use, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { FAKE_USERS, CURRENT_USER } from '@/lib/fake-data';
import { useAuraStore } from '@/store/auraStore';
import { useToastStore } from '@/store/toastStore';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    type: 'text' | 'auraTip';
    auraAmount?: number;
}

const initialMessages: Message[] = [
    { id: 'm1', senderId: 'u2', text: 'yooo did you see the leaderboard today?', timestamp: new Date(Date.now() - 3600000), type: 'text' },
    { id: 'm2', senderId: 'u1', text: 'yes!! im so close to top 3 😤', timestamp: new Date(Date.now() - 3500000), type: 'text' },
    { id: 'm3', senderId: 'u2', text: 'keep grinding you got this 🔥', timestamp: new Date(Date.now() - 3400000), type: 'text' },
    { id: 'm4', senderId: 'u1', text: 'the quests helped a lot honestly', timestamp: new Date(Date.now() - 1800000), type: 'text' },
    { id: 'm5', senderId: 'u2', text: 'send me those OS notes btw 📚', timestamp: new Date(Date.now() - 900000), type: 'text' },
];

export default function ChatThreadPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);
    const otherUser = FAKE_USERS.find((u) => u.id === roomId) || FAKE_USERS[1];
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [showActions, setShowActions] = useState(false);
    const [tipAmount, setTipAmount] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const spendAura = useAuraStore((s) => s.spendAura);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        const msg: Message = { id: `m-${Date.now()}`, senderId: 'u1', text: input.trim(), timestamp: new Date(), type: 'text' };
        setMessages((prev) => [...prev, msg]);
        setInput('');

        // Simulate reply after 2s
        setTimeout(() => {
            const replies = [
                'haha fr 😂', 'no way 💀', 'bet bet', 'say less 🔥', 'im dead 😭',
                'thats so real', 'absolutely', 'wait really??', 'i felt that', 'LMAOOO',
            ];
            const reply: Message = {
                id: `m-${Date.now() + 1}`,
                senderId: otherUser.id,
                text: replies[Math.floor(Math.random() * replies.length)],
                timestamp: new Date(),
                type: 'text',
            };
            setMessages((prev) => [...prev, reply]);
        }, 1500 + Math.random() * 2000);
    };

    const sendAuraTip = () => {
        const amount = parseInt(tipAmount);
        if (!amount || amount <= 0) return;
        const success = spendAura(amount, `Aura tip to ${otherUser.displayName}`);
        if (!success) {
            addToast('error', 'Not enough aura! Farm more 💜');
            return;
        }
        const msg: Message = {
            id: `m-${Date.now()}`,
            senderId: 'u1',
            text: `💜 Sent ${amount} Aura!`,
            timestamp: new Date(),
            type: 'auraTip',
            auraAmount: amount,
        };
        setMessages((prev) => [...prev, msg]);
        addToast('aura', `Sent ${amount} aura to ${otherUser.displayName}!`, -amount);
        setTipAmount('');
        setShowActions(false);
    };

    return (
        <div className="flex flex-col h-screen max-w-[430px] mx-auto" style={{ background: '#0D0D0D' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
                style={{ background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1F1F1F' }}>
                <Link href="/chat"><ArrowLeft size={22} className="text-text-secondary" /></Link>
                <img src={otherUser.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                    <p className="text-sm font-semibold">{otherUser.displayName}</p>
                    <p className="text-[10px] text-text-dim">Online now</p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.senderId === 'u1';
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.type === 'auraTip' ? 'text-center' : ''}`}
                                style={{
                                    background: msg.type === 'auraTip' ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(249,115,22,0.2))' :
                                        isMe ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : '#1A1A1A',
                                    border: msg.type === 'auraTip' ? '1px solid rgba(168,85,247,0.3)' : 'none',
                                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                }}>
                                {msg.type === 'auraTip' ? (
                                    <div>
                                        <span className="text-2xl block mb-1">💜</span>
                                        <span className="font-semibold text-purple">Sent {msg.auraAmount} Aura!</span>
                                    </div>
                                ) : (
                                    <span>{msg.text}</span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Action sheet */}
            <AnimatePresence>
                {showActions && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden px-4" style={{ borderTop: '1px solid #1F1F1F' }}>
                        <div className="py-3 space-y-2">
                            <p className="text-xs text-text-dim">Send Aura Tip</p>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="Amount" value={tipAmount}
                                    onChange={(e) => setTipAmount(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg text-sm"
                                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none', color: '#E5E5E5' }} />
                                <motion.button whileTap={{ scale: 0.9 }} onClick={sendAuraTip}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                                    style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: 'white' }}>
                                    Send ✨
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Composer */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ borderTop: '1px solid #1F1F1F' }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowActions(!showActions)}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: showActions ? 'rgba(168,85,247,0.2)' : '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <Plus size={18} className={showActions ? 'text-purple' : 'text-text-dim'} />
                </motion.button>
                <input type="text" placeholder="Message..." value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none', color: '#E5E5E5' }} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: input.trim() ? 'linear-gradient(135deg, #A855F7, #7C3AED)' : '#2A2A2A' }}>
                    <Send size={16} className="text-white" />
                </motion.button>
            </div>
        </div>
    );
}
