'use client';
import { create } from 'zustand';

interface UIState {
    activeTab: string;
    isComposerOpen: boolean;
    isMatchModalOpen: boolean;
    feedLayer: 'forYou' | 'campusLive' | 'circle';
    swipeMode: 'vibeMatch' | 'randomChaos' | 'department' | 'rival' | 'timeMachine' | 'ghost';
    leaderboardCategory: string;
    zenMode: boolean;
    setActiveTab: (tab: string) => void;
    setComposerOpen: (v: boolean) => void;
    setMatchModalOpen: (v: boolean) => void;
    setFeedLayer: (l: UIState['feedLayer']) => void;
    setSwipeMode: (m: UIState['swipeMode']) => void;
    setLeaderboardCategory: (c: string) => void;
    setZenMode: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeTab: 'feed',
    isComposerOpen: false,
    isMatchModalOpen: false,
    feedLayer: 'forYou',
    swipeMode: 'vibeMatch',
    leaderboardCategory: 'overall',
    zenMode: false,
    setActiveTab: (tab) => set({ activeTab: tab }),
    setComposerOpen: (v) => set({ isComposerOpen: v }),
    setMatchModalOpen: (v) => set({ isMatchModalOpen: v }),
    setFeedLayer: (l) => set({ feedLayer: l }),
    setSwipeMode: (m) => set({ swipeMode: m }),
    setLeaderboardCategory: (c) => set({ leaderboardCategory: c }),
    setZenMode: (v) => set({ zenMode: v }),
}));
