import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, departments(code, name, color, icon), degrees(code, name)')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);

    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);

    return data.publicUrl;
}

export async function getAvatarPresets() {
    const { data, error } = await supabase
        .from('avatar_presets')
        .select('*')
        .eq('is_active', true)
        .order('category');
    if (error) throw error;
    return data;
}

export async function getDepartments() {
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('code');
    if (error) throw error;
    return data;
}

export async function getDegrees(departmentId: string) {
    const { data, error } = await supabase
        .from('degrees')
        .select('*')
        .eq('department_id', departmentId);
    if (error) throw error;
    return data;
}
