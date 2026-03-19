import { supabase } from '@/lib/supabase';

export async function getEvents(filter: 'upcoming' | 'past' = 'upcoming') {
    let query = supabase
        .from('events')
        .select('*, organizer:organizer_id(display_name, avatar_url), society:society_id(name, short_name, logo_url)')
        .eq('is_cancelled', false);

    if (filter === 'upcoming') {
        query = query.gte('starts_at', new Date().toISOString()).order('starts_at', { ascending: true });
    } else {
        query = query.lt('starts_at', new Date().toISOString()).order('starts_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getEvent(eventId: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*, organizer:organizer_id(display_name, avatar_url, handle), society:society_id(name, short_name, logo_url)')
        .eq('id', eventId)
        .single();
    if (error) throw error;
    return data;
}

export async function createEvent(event: {
    title: string;
    description?: string;
    location: string;
    cover_image_url?: string;
    organizer_id: string;
    society_id?: string;
    max_capacity?: number;
    ticket_price?: number;
    ticket_type?: string;
    starts_at: string;
    ends_at?: string;
}) {
    const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function bookTicket(eventId: string, userId: string, auraCost: number = 0) {
    const ticketCode = `FST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const { data, error } = await supabase
        .from('event_tickets')
        .insert({
            event_id: eventId,
            user_id: userId,
            ticket_code: ticketCode,
            aura_paid: auraCost,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getMyTickets(userId: string) {
    const { data, error } = await supabase
        .from('event_tickets')
        .select('*, events:event_id(title, location, starts_at, ends_at, cover_image_url)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getTicket(eventId: string, userId: string) {
    const { data } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
    return data;
}

export async function cancelTicket(ticketId: string) {
    const { error } = await supabase
        .from('event_tickets')
        .update({ status: 'cancelled' })
        .eq('id', ticketId);
    if (error) throw error;
}

export async function getEventAttendees(eventId: string, limit = 10) {
    const { data, error } = await supabase
        .from('event_tickets')
        .select('*, profiles:user_id(display_name, avatar_url, handle)')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .limit(limit);
    if (error) throw error;
    return data;
}
