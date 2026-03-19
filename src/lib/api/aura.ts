import { supabase } from '@/lib/supabase';

export async function addAura(userId: string, amount: number, category: string, reason: string, sourceId?: string) {
    const { data, error } = await supabase.rpc('add_aura', {
        p_user_id: userId,
        p_amount: amount,
        p_category: category,
        p_reason: reason,
        p_source_id: sourceId || null,
    });
    if (error) throw error;
    return data as number;
}

export async function getAuraTransactions(userId: string, limit = 20) {
    const { data, error } = await supabase
        .from('aura_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data;
}

export async function getAuraHistory(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
        .from('aura_transactions')
        .select('amount, category, created_at')
        .eq('user_id', userId)
        .gte('created_at', since)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
}
