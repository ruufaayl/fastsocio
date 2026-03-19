'use client';
/** Post composer modal — creates real posts via Supabase */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { useToastStore } from '@/store/toastStore';
import { uploadPostImage } from '@/lib/api/posts';
import NeonButton from '@/components/shared/NeonButton';
import type { PostType } from '@/types/post';

interface PostComposerProps {
    isOpen: boolean;
    onClose: () => void;
}

const POST_TYPES: { id: PostType; label: string; maxChars: number }[] = [
    { id: 'thread', label: '💬 Thread', maxChars: 2000 },
    { id: 'visualDrop', label: '📸 Visual', maxChars: 2000 },
    { id: 'poll', label: '📊 Poll', maxChars: 500 },
    { id: 'hotTake', label: '🎤 Hot Take', maxChars: 2000 },
    { id: 'confession', label: '🤫 Confession', maxChars: 2000 },
    { id: 'rant', label: '😤 Rant', maxChars: 2000 },
    { id: 'studySOS', label: '🆘 Study SOS', maxChars: 2000 },
    { id: 'challenge', label: '⚔️ Challenge', maxChars: 2000 },
    { id: 'appreciation', label: '💜 Appreciation', maxChars: 2000 },
    { id: 'campusReview', label: '📍 Review', maxChars: 2000 },
    { id: 'eventDrop', label: '📅 Event', maxChars: 2000 },
    { id: 'prediction', label: '🔮 Prediction', maxChars: 2000 },
    { id: 'collabRequest', label: '🤝 Collab', maxChars: 2000 },
    { id: 'auraFlex', label: '✨ Flex', maxChars: 500 },
];

export default function PostComposer({ isOpen, onClose }: PostComposerProps) {
    const user = useAuthStore((s) => s.user);
    const [type, setType] = useState<PostType>('thread');
    const [content, setContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [courseCode, setCourseCode] = useState('');
    const [urgency, setUrgency] = useState<'chill' | 'kindaUrgent' | 'dueTomorrow'>('chill');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addPost = useFeedStore((s) => s.addPost);
    const addToast = useToastStore((s) => s.addToast);

    const currentConfig = POST_TYPES.find((t) => t.id === type) || POST_TYPES[0];
    const forceAnon = type === 'confession' || type === 'hotTake';

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() || !user) return;
        setIsSubmitting(true);

        try {
            let imageUrl: string | undefined;
            if (imageFile) {
                imageUrl = await uploadPostImage(user.id, imageFile);
            }

            await addPost({
                type,
                user_id: forceAnon || isAnonymous ? null : user.id,
                content: content.trim(),
                image_url: imageUrl,
                is_anonymous: forceAnon || isAnonymous,
                poll_data: type === 'poll' ? { options: pollOptions.filter(Boolean).map((text, i) => ({ id: `po-${i}`, text, votes: 0 })) } : undefined,
                study_sos_data: type === 'studySOS' ? { courseCode, urgency, isSolved: false, answerCount: 0 } : undefined,
                hot_take_data: type === 'hotTake' ? { agreePercentage: 50, disagreePercentage: 50, totalVotes: 0, status: 'active' } : undefined,
                expires_at: type === 'rant' ? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() : undefined,
            });

            addToast('aura', 'Post shared! +10 aura 🔥', 10);

            // Reset
            setContent('');
            setIsAnonymous(false);
            setCourseCode('');
            setPollOptions(['', '']);
            setImageFile(null);
            setImagePreview(null);
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create post';
            addToast('error', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60]"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[61] max-w-[430px] mx-auto rounded-t-2xl overflow-hidden"
                        style={{ background: '#0D0D0D', border: '1px solid #2A2A2A', borderBottom: 'none', maxHeight: '90vh' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1F1F1F' }}>
                            <button onClick={onClose} className="text-text-dim hover:text-text-primary"><X size={22} /></button>
                            <h3 className="font-heading font-semibold text-sm">Create Post</h3>
                            <NeonButton size="sm" onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
                                <Send size={14} className="mr-1" /> {isSubmitting ? '...' : 'Post'}
                            </NeonButton>
                        </div>

                        <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 56px)' }}>
                            {/* Type selector */}
                            <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                                {POST_TYPES.map((t) => (
                                    <button key={t.id} onClick={() => { setType(t.id); setContent(''); }}
                                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                                        style={{
                                            background: type === t.id ? 'rgba(168,85,247,0.15)' : '#1A1A1A',
                                            color: type === t.id ? '#A855F7' : '#555',
                                            border: `1px solid ${type === t.id ? 'rgba(168,85,247,0.3)' : '#2A2A2A'}`,
                                        }}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content area */}
                            <div className="px-4 pb-4">
                                {forceAnon && (
                                    <div className="flex items-center gap-2 mb-3 text-xs px-3 py-2 rounded-lg" style={{ background: '#1A1A1A' }}>
                                        <EyeOff size={14} className="text-purple" />
                                        <span className="text-text-secondary">This post type is always anonymous</span>
                                    </div>
                                )}
                                {type === 'rant' && (
                                    <div className="flex items-center gap-2 mb-3 text-xs px-3 py-2 rounded-lg" style={{ background: '#EF444415', border: '1px solid #EF444430' }}>
                                        <span>😤</span>
                                        <span className="text-red">Rants expire after 6 hours</span>
                                    </div>
                                )}

                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value.slice(0, currentConfig.maxChars))}
                                    placeholder={
                                        type === 'confession' ? "What's on your mind? Nobody will know... 🤫" :
                                            type === 'hotTake' ? 'Drop your hottest take... 🎤' :
                                                type === 'rant' ? 'LET IT OUT 😤' :
                                                    type === 'studySOS' ? 'What do you need help with?' :
                                                        type === 'appreciation' ? 'Who deserves some love? 💜' :
                                                            "What's happening?"
                                    }
                                    className="w-full min-h-[120px] p-3 rounded-xl resize-none text-sm"
                                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', outline: 'none', color: '#E5E5E5' }}
                                />

                                {/* Image preview */}
                                {imagePreview && (
                                    <div className="relative mt-2 rounded-xl overflow-hidden">
                                        <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
                                        <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                                            <X size={14} className="text-white" />
                                        </button>
                                    </div>
                                )}

                                {/* Char counter + controls */}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${content.length > currentConfig.maxChars * 0.9 ? 'text-red' : 'text-text-dim'}`}>
                                            {content.length}/{currentConfig.maxChars}
                                        </span>
                                        <label className="cursor-pointer text-text-dim hover:text-purple transition-colors">
                                            <ImageIcon size={16} />
                                            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                        </label>
                                    </div>

                                    {!forceAnon && (
                                        <button onClick={() => setIsAnonymous(!isAnonymous)}
                                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
                                            style={{
                                                background: isAnonymous ? 'rgba(168,85,247,0.15)' : '#1A1A1A',
                                                color: isAnonymous ? '#A855F7' : '#555',
                                                border: `1px solid ${isAnonymous ? 'rgba(168,85,247,0.3)' : '#2A2A2A'}`,
                                            }}>
                                            {isAnonymous ? <EyeOff size={12} /> : <Eye size={12} />}
                                            {isAnonymous ? 'Anonymous' : 'Public'}
                                        </button>
                                    )}
                                </div>

                                {/* Study SOS fields */}
                                {type === 'studySOS' && (
                                    <div className="mt-3 space-y-2">
                                        <input type="text" placeholder="Course code (e.g. CS301)" value={courseCode}
                                            onChange={(e) => setCourseCode(e.target.value)} className="input-dark text-sm" />
                                        <div className="flex gap-2">
                                            {(['chill', 'kindaUrgent', 'dueTomorrow'] as const).map((u) => (
                                                <button key={u} onClick={() => setUrgency(u)}
                                                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                                    style={{
                                                        background: urgency === u ? (u === 'dueTomorrow' ? '#EF444420' : u === 'kindaUrgent' ? '#FACC1520' : '#22C55E20') : '#1A1A1A',
                                                        color: urgency === u ? (u === 'dueTomorrow' ? '#EF4444' : u === 'kindaUrgent' ? '#FACC15' : '#22C55E') : '#555',
                                                        border: `1px solid ${urgency === u ? (u === 'dueTomorrow' ? '#EF444440' : u === 'kindaUrgent' ? '#FACC1540' : '#22C55E40') : '#2A2A2A'}`,
                                                    }}>
                                                    {u === 'chill' ? '🟢 Chill' : u === 'kindaUrgent' ? '🟡 Urgent' : '🔴 DUE TMR'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Poll options */}
                                {type === 'poll' && (
                                    <div className="mt-3 space-y-2">
                                        {pollOptions.map((opt, i) => (
                                            <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt}
                                                onChange={(e) => { const opts = [...pollOptions]; opts[i] = e.target.value; setPollOptions(opts); }}
                                                className="input-dark text-sm" />
                                        ))}
                                        {pollOptions.length < 4 && (
                                            <button onClick={() => setPollOptions([...pollOptions, ''])}
                                                className="text-xs text-purple hover:underline">+ Add option</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
