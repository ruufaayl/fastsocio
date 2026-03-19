'use client';
/** Reusable modal component with dark overlay */
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60]"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[90%] max-w-[400px] max-h-[85vh] overflow-auto card-glass p-5"
                    >
                        {title && (
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading text-lg font-semibold">{title}</h2>
                                <button onClick={onClose} className="text-text-dim hover:text-text-primary transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
