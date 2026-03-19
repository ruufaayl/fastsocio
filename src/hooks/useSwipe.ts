'use client';
import { useState, useCallback } from 'react';
import { FAKE_USERS } from '@/lib/fake-data';
import type { User } from '@/types/user';

/** Hook for swipe card management and match logic */
export function useSwipe() {
    const [deck, setDeck] = useState<User[]>(FAKE_USERS.slice(1));
    const [matches, setMatches] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentCard = deck[currentIndex] || null;

    const swipeRight = useCallback(() => {
        if (!currentCard) return;
        // Simulate ~40% match rate
        if (Math.random() > 0.6) {
            setMatches((prev) => [...prev, currentCard]);
        }
        setCurrentIndex((i) => i + 1);
    }, [currentCard]);

    const swipeLeft = useCallback(() => {
        setCurrentIndex((i) => i + 1);
    }, []);

    const superAura = useCallback(() => {
        if (!currentCard) return;
        setMatches((prev) => [...prev, currentCard]);
        setCurrentIndex((i) => i + 1);
    }, [currentCard]);

    const resetDeck = useCallback(() => {
        setDeck(FAKE_USERS.slice(1).sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
    }, []);

    return { currentCard, deck: deck.slice(currentIndex), matches, swipeRight, swipeLeft, superAura, resetDeck, cardsLeft: deck.length - currentIndex };
}
