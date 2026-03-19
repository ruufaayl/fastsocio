import { supabase } from '@/lib/supabase';

export async function getLeaderboard(category: string = 'overall', limit = 50) {
    let query = supabase.from('profiles').select('*, departments:department_id(code, name, color, icon)');

    switch (category) {
        case 'social':
            query = query.order('aura_social', { ascending: false });
            break;
        case 'content':
            query = query.order('aura_content', { ascending: false });
            break;
        case 'campus':
            query = query.order('aura_campus', { ascending: false });
            break;
        case 'wisdom':
            query = query.order('aura_wisdom', { ascending: false });
            break;
        default:
            query = query.order('total_aura', { ascending: false });
    }

    const { data, error } = await query.limit(limit);
    if (error) throw error;
    return data;
}

export async function getDepartmentLeaderboard() {
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('total_aura', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getDepartmentRivalries() {
    const { data, error } = await supabase
        .from('department_rivalry')
        .select('*, dept_a_info:dept_a(code, name, color, icon), dept_b_info:dept_b(code, name, color, icon)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getDepartmentTopMembers(departmentId: string, limit = 5) {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, handle, display_name, avatar_url, total_aura')
        .eq('department_id', departmentId)
        .order('total_aura', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data;
}

export async function getUserRank(userId: string): Promise<number> {
    const { data: user } = await supabase
        .from('profiles')
        .select('total_aura')
        .eq('id', userId)
        .single();

    if (!user) return 0;

    const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('total_aura', user.total_aura);

    return (count || 0) + 1;
}
