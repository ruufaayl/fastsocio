'use client';
/** Global toast notification system */
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import type { ToastType } from '@/store/toastStore';

const TOAST_CONFIG: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', icon: '✅' },
    aura: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', icon: '✨' },
    warning: { bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)', icon: '⚠️' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '❌' },
    match: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', icon: '💘' },
};

export default function ToastProvider() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] w-full max-w-[400px] px-4 flex flex-col-reverse gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const config = TOAST_CONFIG[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="pointer-events-auto rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg"
                            style={{
                                background: config.bg,
                                border: `1px solid ${config.border}`,
                                backdropFilter: 'blur(16px)',
                            }}
                        >
                            <span className="text-lg flex-shrink-0">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary">{toast.message}</p>
                                {toast.auraImpact !== undefined && toast.auraImpact !== 0 && (
                                    <p className="text-xs font-semibold mt-0.5" style={{ color: toast.auraImpact > 0 ? '#A855F7' : '#EF4444' }}>
                                        {toast.auraImpact > 0 ? '+' : ''}{toast.auraImpact} aura
                                    </p>
                                )}
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="text-text-dim hover:text-text-primary transition-colors flex-shrink-0">
                                <X size={14} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
