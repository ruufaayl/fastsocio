'use client';
import { useState } from 'react';
import { FAKE_LEADERBOARD } from '@/lib/fake-data';
import type { LeaderboardEntry, LeaderboardCategory } from '@/types/aura';

/** Hook for leaderboard state and category switching */
export function useLeaderboard() {
    const [category, setCategory] = useState<LeaderboardCategory>('overall');
    const [entries] = useState<LeaderboardEntry[]>(FAKE_LEADERBOARD);

    return { category, setCategory, entries };
}
