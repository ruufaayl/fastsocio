'use client';
/** Modal to create a new whiteboard pin/post */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createWhiteboardPost, uploadWhiteboardMedia } from '@/lib/api/whiteboard';

const PIN_COLORS = [
    { id: 'red', color: '#EF4444', label: 'Red' },
    { id: 'blue', color: '#3B82F6', label: 'Blue' },
    { id: 'green', color: '#22C55E', label: 'Green' },
    { id: 'yellow', color: '#FACC15', label: 'Yellow' },
    { id: 'purple', color: '#A855F7', label: 'Purple' },
];

interface AddPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (post: any) => void;
}

export default function AddPinModal({ isOpen, onClose, onCreated }: AddPinModalProps) {
    const user = useAuthStore((s) => s.user);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [caption, setCaption] = useState('');
    const [pinColor, setPinColor] = useState('red');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setError('');
        const url = URL.createObjectURL(f);
        setPreview(url);
    }

    function resetForm() {
        setCaption('');
        setPinColor('red');
        setFile(null);
        setPreview(null);
        setError('');
        setUploading(false);
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    async function handleSubmit() {
        if (!user) return;
        if (!file) {
            setError('Please select an image or video');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const mediaUrl = await uploadWhiteboardMedia(user.id, file);
            const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

            const post = await createWhiteboardPost({
                user_id: user.id,
                media_url: mediaUrl,
                media_type: mediaType as 'image' | 'video',
                caption: caption.trim() || undefined,
                pin_color: pinColor,
            });

            onCreated?.(post);
            handleClose();
        } catch (err) {
            console.error('Failed to create pin:', err);
            setError('Failed to create pin. Try again.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[60]"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[92%] max-w-[400px] card-glass p-5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-heading text-lg font-semibold text-text-primary">Pin to Board</h2>
                            <button onClick={handleClose} className="text-text-dim hover:text-text-primary transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Media upload */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {preview ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-bg-elevated"
                            >
                                {file?.type.startsWith('video/') ? (
                                    <video src={preview} className="w-full h-full object-cover" muted playsInline autoPlay loop />
                                ) : (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                )}
                                <button
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-bg-base/70 backdrop-blur-sm flex items-center justify-center text-text-dim hover:text-text-primary transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-white/[0.08] bg-bg-elevated/50 flex flex-col items-center justify-center gap-3 mb-4 hover:border-purple/30 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-purple/10 flex items-center justify-center">
                                    <Camera size={22} className="text-purple" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-text-secondary font-medium">Tap to upload</p>
                                    <p className="text-xs text-text-dim mt-0.5">Photo or video</p>
                                </div>
                            </button>
                        )}

                        {/* Caption */}
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption..."
                            maxLength={200}
                            rows={2}
                            className="input-dark resize-none mb-4"
                        />

                        {/* Pin color */}
                        <div className="mb-5">
                            <p className="text-xs text-text-dim mb-2 font-medium">Pin Color</p>
                            <div className="flex items-center gap-3">
                                {PIN_COLORS.map((pc) => (
                                    <button
                                        key={pc.id}
                                        onClick={() => setPinColor(pc.id)}
                                        className="relative w-8 h-8 rounded-full transition-transform"
                                        style={{
                                            background: pc.color,
                                            transform: pinColor === pc.id ? 'scale(1.2)' : 'scale(1)',
                                            boxShadow: pinColor === pc.id ? `0 0 12px ${pc.color}60` : 'none',
                                        }}
                                    >
                                        {pinColor === pc.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <Check size={14} className="text-white drop-shadow" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-red mb-3">{error}</p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={uploading || !file}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Pinning...
                                </>
                            ) : (
                                'Pin It!'
                            )}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
