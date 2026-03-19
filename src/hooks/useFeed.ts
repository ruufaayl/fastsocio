'use client';
import { useState } from 'react';
import { FAKE_POSTS } from '@/lib/fake-data';
import type { Post, FeedLayer } from '@/types/post';

/** Hook for feed state and filtering */
export function useFeed() {
    const [posts] = useState<Post[]>(FAKE_POSTS);
    const [activeLayer, setActiveLayer] = useState<FeedLayer>('forYou');

    const filteredPosts = posts.filter(() => {
        // In real app, filter by layer logic; demo returns all
        return true;
    });

    return { posts: filteredPosts, activeLayer, setActiveLayer };
}
