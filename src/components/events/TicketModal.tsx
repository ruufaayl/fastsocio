'use client';
/** Ticket detail / booking modal for events */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, Sparkles, Ticket, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { bookTicket, getTicket, getEventAttendees } from '@/lib/api/events';
import ConfettiBlast from '@/components/shared/ConfettiBlast';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
    onBooked?: () => void;
}

function formatFullDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function TicketModal({ isOpen, onClose, event, onBooked }: TicketModalProps) {
    const user = useAuthStore((s) => s.user);
    const [step, setStep] = useState<'detail' | 'confirm' | 'ticket'>('detail');
    const [booking, setBooking] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [existingTicket, setExistingTicket] = useState<any>(null);

    useEffect(() => {
        if (isOpen && event && user) {
            // Check existing ticket
            getTicket(event.id, user.id).then((t) => {
                if (t) {
                    setExistingTicket(t);
                    setTicketData(t);
                }
            });
            // Load attendees
            getEventAttendees(event.id, 8).then(setAttendees).catch(() => {});
        }
        if (!isOpen) {
            setStep('detail');
            setTicketData(null);
            setExistingTicket(null);
            setShowConfetti(false);
        }
    }, [isOpen, event, user]);

    async function handleBook() {
        if (!user || !event) return;
        setBooking(true);
        try {
            const ticket = await bookTicket(event.id, user.id, event.ticket_price || 0);
            setTicketData(ticket);
            setStep('ticket');
            setShowConfetti(true);
            onBooked?.();
        } catch (err) {
            console.error('Booking failed:', err);
        } finally {
            setBooking(false);
        }
    }

    if (!event) return null;

    const isPast = new Date(event.starts_at) < new Date();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <ConfettiBlast trigger={showConfetti} />
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
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[92%] max-w-[400px] max-h-[85vh] overflow-auto card-glass"
                    >
                        {/* Cover */}
                        <div className="relative h-44 overflow-hidden rounded-t-[20px]">
                            {event.cover_image_url ? (
                                <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple/30 via-bg-elevated to-orange/20" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent" />
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bg-base/60 backdrop-blur-sm flex items-center justify-center text-text-dim hover:text-text-primary transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 pt-3">
                            <AnimatePresence mode="wait">
                                {step === 'detail' && (
                                    <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                                        <h2 className="font-heading text-xl font-bold text-text-primary mb-1">{event.title}</h2>

                                        {/* Society / Organizer */}
                                        <div className="flex items-center gap-2 mb-4">
                                            {event.society?.logo_url ? (
                                                <img src={event.society.logo_url} className="w-5 h-5 rounded-full" alt="" />
                                            ) : event.organizer?.avatar_url ? (
                                                <img src={event.organizer.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                                            ) : null}
                                            <span className="text-sm text-text-secondary">
                                                {event.society?.name || event.organizer?.display_name}
                                            </span>
                                        </div>

                                        {/* Meta */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <Calendar size={14} className="text-purple shrink-0" />
                                                <span>{formatFullDate(event.starts_at)} at {formatTime(event.starts_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <MapPin size={14} className="text-orange shrink-0" />
                                                <span>{event.location}</span>
                                            </div>
                                            {event.ticket_price != null && (
                                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                    <Sparkles size={14} className="text-yellow shrink-0" />
                                                    <span>{event.ticket_price === 0 ? 'Free entry' : `${event.ticket_price} aura`}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {event.description && (
                                            <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                                {event.description}
                                            </p>
                                        )}

                                        {/* Attendees */}
                                        {attendees.length > 0 && (
                                            <div className="mb-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users size={14} className="text-text-dim" />
                                                    <span className="text-xs text-text-dim">{event.rsvp_count || attendees.length} going</span>
                                                </div>
                                                <div className="flex -space-x-2">
                                                    {attendees.slice(0, 6).map((a: any, i: number) => (
                                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-bg-surface overflow-hidden">
                                                            {a.profiles?.avatar_url ? (
                                                                <img src={a.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full bg-purple/20 flex items-center justify-center text-[9px] font-bold text-purple">
                                                                    {a.profiles?.display_name?.[0] || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {attendees.length > 6 && (
                                                        <div className="w-7 h-7 rounded-full border-2 border-bg-surface bg-bg-elevated flex items-center justify-center text-[9px] font-bold text-text-dim">
                                                            +{attendees.length - 6}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action */}
                                        {existingTicket ? (
                                            <button
                                                onClick={() => { setTicketData(existingTicket); setStep('ticket'); }}
                                                className="btn-ghost w-full flex items-center justify-center gap-2"
                                            >
                                                <Ticket size={16} />
                                                View My Ticket
                                            </button>
                                        ) : !isPast ? (
                                            <button
                                                onClick={() => setStep('confirm')}
                                                className="btn-primary w-full flex items-center justify-center gap-2"
                                            >
                                                <Ticket size={16} />
                                                Book Ticket
                                            </button>
                                        ) : (
                                            <div className="text-center text-sm text-text-dim py-2">This event has ended</div>
                                        )}
                                    </motion.div>
                                )}

                                {step === 'confirm' && (
                                    <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">Confirm Booking</h3>
                                        <p className="text-sm text-text-secondary mb-4">
                                            You are about to book a ticket for <span className="text-text-primary font-medium">{event.title}</span>.
                                        </p>

                                        <div className="surface p-3 rounded-xl mb-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-dim">Event</span>
                                                <span className="text-text-primary font-medium">{event.title}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-dim">Date</span>
                                                <span className="text-text-secondary">{formatFullDate(event.starts_at)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-dim">Cost</span>
                                                <span className="text-yellow font-semibold flex items-center gap-1">
                                                    <Sparkles size={12} />
                                                    {event.ticket_price === 0 ? 'Free' : `${event.ticket_price} aura`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button onClick={() => setStep('detail')} className="btn-ghost flex-1">
                                                Back
                                            </button>
                                            <button onClick={handleBook} disabled={booking} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                                {booking ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                {booking ? 'Booking...' : 'Confirm'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'ticket' && ticketData && (
                                    <motion.div
                                        key="ticket"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                    >
                                        <div className="text-center mb-4">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                                                className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-3"
                                            >
                                                <Check size={28} className="text-green" />
                                            </motion.div>
                                            <h3 className="font-heading text-lg font-semibold text-text-primary">You&apos;re In!</h3>
                                            <p className="text-sm text-text-secondary">Ticket booked successfully</p>
                                        </div>

                                        {/* Ticket visual */}
                                        <div className="relative bg-bg-elevated rounded-2xl overflow-hidden border border-white/[0.06] mb-4">
                                            {/* Notch cutouts */}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-bg-surface" />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-bg-surface" />

                                            <div className="p-4 pb-3 border-b border-dashed border-white/[0.06]">
                                                <h4 className="font-heading font-bold text-text-primary text-base leading-tight">{event.title}</h4>
                                                <p className="text-xs text-text-secondary mt-1">{event.location}</p>
                                            </div>

                                            <div className="p-4 pt-3 flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Date</div>
                                                    <div className="text-sm text-text-primary font-medium">{formatFullDate(event.starts_at)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Time</div>
                                                    <div className="text-sm text-text-primary font-medium">{formatTime(event.starts_at)}</div>
                                                </div>
                                            </div>

                                            {/* QR-like code area */}
                                            <div className="p-4 pt-0 flex flex-col items-center">
                                                <div className="w-full h-px bg-white/[0.04] mb-3" />
                                                {/* Ticket code as styled barcode-like element */}
                                                <div className="flex items-center gap-1 mb-2">
                                                    {ticketData.ticket_code.split('').map((char: string, i: number) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ scaleY: 0 }}
                                                            animate={{ scaleY: 1 }}
                                                            transition={{ delay: 0.3 + i * 0.03 }}
                                                            className="bg-white/80 rounded-sm"
                                                            style={{
                                                                width: char === '-' ? 2 : 3,
                                                                height: char === '-' ? 12 : 16 + (char.charCodeAt(0) % 10) * 1.5,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-mono text-xs text-text-secondary tracking-widest">
                                                    {ticketData.ticket_code}
                                                </span>
                                            </div>
                                        </div>

                                        <button onClick={onClose} className="btn-ghost w-full">
                                            Done
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
