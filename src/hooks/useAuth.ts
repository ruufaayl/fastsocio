'use client';
import { useAuthStore } from '@/store/authStore';

/** Hook for auth state and actions */
export function useAuth() {
    const { user, isAuthenticated, login, logout, updateProfile, isOnboarding, setOnboarding } = useAuthStore();
    return { user, isAuthenticated, login, logout, updateProfile, isOnboarding, setOnboarding };
}
