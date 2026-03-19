'use client';
/** Reusable event card for the events page */
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
    event: any;
    onClick: () => void;
    featured?: boolean;
    index?: number;
}

function formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
    const day = d.toLocaleDateString('en-US', { day: 'numeric' });
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { day, month, time };
}

export default function EventCard({ event, onClick, featured = false, index = 0 }: EventCardProps) {
    const { day, month, time } = formatEventDate(event.starts_at);
    const societyName = event.society?.short_name || event.society?.name;
    const organizerName = event.organizer?.display_name || 'Unknown';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={cn(
                'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200',
                featured
                    ? 'p-[1px] bg-gradient-to-br from-purple via-orange to-yellow'
                    : 'border border-white/[0.06]'
            )}
        >
            <div className="bg-bg-surface rounded-2xl overflow-hidden">
                {/* Cover image */}
                <div className="relative h-36 overflow-hidden">
                    {event.cover_image_url ? (
                        <img
                            src={event.cover_image_url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple/20 via-bg-elevated to-orange/10" />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent" />

                    {/* Date chip */}
                    <div className="absolute top-3 left-3 bg-bg-base/80 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center border border-white/[0.06]">
                        <div className="text-xs font-bold text-purple leading-none">{month}</div>
                        <div className="text-lg font-heading font-bold text-text-primary leading-tight">{day}</div>
                    </div>

                    {/* Price chip */}
                    {event.ticket_price != null && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-bg-base/80 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/[0.06]">
                            <Sparkles size={12} className="text-yellow" />
                            <span className="text-xs font-semibold text-yellow">
                                {event.ticket_price === 0 ? 'Free' : `${event.ticket_price} aura`}
                            </span>
                        </div>
                    )}

                    {featured && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                            <Sparkles size={12} className="text-white" />
                            <span className="text-xs font-semibold text-white">Featured</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3.5 pt-2">
                    <h3 className="font-heading font-semibold text-[15px] text-text-primary leading-snug mb-1.5 line-clamp-1">
                        {event.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-text-secondary mb-2">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-purple" />
                            {time}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-orange" />
                            <span className="truncate max-w-[120px]">{event.location}</span>
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            {event.organizer?.avatar_url ? (
                                <img src={event.organizer.avatar_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-purple/20 flex items-center justify-center text-[9px] text-purple font-bold">
                                    {organizerName[0]}
                                </div>
                            )}
                            <span className="text-xs text-text-dim">
                                {societyName || organizerName}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-text-dim">
                            <Users size={12} />
                            <span>{event.rsvp_count || 0}</span>
                            {event.max_capacity && (
                                <span className="text-text-dim">/ {event.max_capacity}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
