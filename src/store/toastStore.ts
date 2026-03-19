'use client';
import { create } from 'zustand';

export type ToastType = 'success' | 'aura' | 'warning' | 'error' | 'match';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    auraImpact?: number;
    createdAt: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, auraImpact?: number) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (type, message, auraImpact) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((s) => ({ toasts: [...s.toasts, { id, type, message, auraImpact, createdAt: Date.now() }] }));
        // Auto-dismiss after 3s
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 3000);
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
