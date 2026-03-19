'use client';
/** Events page — university events with upcoming/past/my tickets tabs */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarDays, Clock, Ticket, Search } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import EventCard from '@/components/events/EventCard';
import TicketModal from '@/components/events/TicketModal';
import EmptyState from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { getEvents, getMyTickets } from '@/lib/api/events';
import { staggerContainer, staggerItem } from '@/lib/design-system';

type TabId = 'upcoming' | 'past' | 'mytickets';

const TABS: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
    { id: 'upcoming', label: 'Upcoming', icon: CalendarDays },
    { id: 'past', label: 'Past', icon: Clock },
    { id: 'mytickets', label: 'My Tickets', icon: Ticket },
];

export default function EventsPage() {
    const user = useAuthStore((s) => s.user);
    const [activeTab, setActiveTab] = useState<TabId>('upcoming');
    const [events, setEvents] = useState<any[]>([]);
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'mytickets') {
                if (user) {
                    const tickets = await getMyTickets(user.id);
                    setMyTickets(tickets || []);
                }
            } else {
                const data = await getEvents(activeTab === 'upcoming' ? 'upcoming' : 'past');
                setEvents(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function openEvent(event: any) {
        setSelectedEvent(event);
        setModalOpen(true);
    }

    function openTicketEvent(ticket: any) {
        // Build a partial event from ticket data for the modal
        const event = {
            id: ticket.event_id,
            title: ticket.events?.title,
            location: ticket.events?.location,
            starts_at: ticket.events?.starts_at,
            ends_at: ticket.events?.ends_at,
            cover_image_url: ticket.events?.cover_image_url,
        };
        setSelectedEvent(event);
        setModalOpen(true);
    }

    // Determine featured events (first 2 upcoming events)
    const featuredIds = activeTab === 'upcoming' ? events.slice(0, 2).map((e) => e.id) : [];

    return (
        <ScreenTransition>
            <TopBar />

            {/* Header */}
            <div className="px-4 pt-2 pb-1">
                <h1 className="font-heading text-2xl font-bold text-text-primary">Events</h1>
                <p className="text-sm text-text-secondary mt-0.5">What&apos;s happening on campus</p>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 px-4 mt-3 mb-4">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full"
                            style={{
                                color: isActive ? '#A855F7' : '#555555',
                                background: isActive ? 'rgba(168,85,247,0.1)' : 'transparent',
                            }}
                        >
                            <Icon size={14} />
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="events-tab-indicator"
                                    className="absolute inset-0 rounded-full border border-purple/20"
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="px-4 pb-28">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton h-52 rounded-2xl" />
                            ))}
                        </motion.div>
                    ) : activeTab === 'mytickets' ? (
                        <motion.div key="tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {myTickets.length === 0 ? (
                                <EmptyState
                                    icon="🎫"
                                    title="No Tickets Yet"
                                    description="Book tickets to upcoming events and they'll appear here."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {myTickets.map((ticket, i) => (
                                        <motion.div
                                            key={ticket.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => openTicketEvent(ticket)}
                                            className="surface p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-purple/20 transition-all"
                                        >
                                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                                {ticket.events?.cover_image_url ? (
                                                    <img src={ticket.events.cover_image_url} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple/20 to-orange/10" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-heading text-sm font-semibold text-text-primary truncate">
                                                    {ticket.events?.title || 'Event'}
                                                </h4>
                                                <p className="text-xs text-text-secondary mt-0.5">
                                                    {ticket.events?.starts_at
                                                        ? new Date(ticket.events.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                        : ''}
                                                </p>
                                                <span className="font-mono text-[10px] text-text-dim tracking-wider">
                                                    {ticket.ticket_code}
                                                </span>
                                            </div>
                                            <div
                                                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                                style={{
                                                    background: ticket.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                    color: ticket.status === 'confirmed' ? '#22C55E' : '#EF4444',
                                                }}
                                            >
                                                {ticket.status === 'confirmed' ? 'Active' : 'Cancelled'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            exit={{ opacity: 0 }}
                        >
                            {events.length === 0 ? (
                                <EmptyState
                                    icon={activeTab === 'upcoming' ? '📅' : '📭'}
                                    title={activeTab === 'upcoming' ? 'No Upcoming Events' : 'No Past Events'}
                                    description={activeTab === 'upcoming' ? 'Check back soon for new events!' : 'Past events will show up here.'}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {events.map((event, i) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            onClick={() => openEvent(event)}
                                            featured={featuredIds.includes(event.id)}
                                            index={i}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* FAB - Create Event (for society admins) */}
            {user?.is_society_admin && (
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                        boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
                    }}
                >
                    <Plus size={24} className="text-white" />
                </motion.button>
            )}

            {/* Ticket modal */}
            <TicketModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                event={selectedEvent}
                onBooked={fetchData}
            />
        </ScreenTransition>
    );
}
