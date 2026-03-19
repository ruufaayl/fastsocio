'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;
const TEXT_LIMIT = 2000;

interface FeedState {
    posts: any[];
    isLoading: boolean;
    hasMore: boolean;
    userReactions: Record<string, string>;
    bookmarks: Set<string>;
    loadFeed: (userId: string, reset?: boolean) => Promise<void>;
    reactToPost: (userId: string, postId: string, reaction: string) => Promise<void>;
    bookmarkPost: (userId: string, postId: string) => Promise<boolean>;
    addPost: (post: Record<string, any>) => Promise<void>;
    addComment: (postId: string, userId: string, content: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
    posts: [],
    isLoading: false,
    hasMore: true,
    userReactions: {},
    bookmarks: new Set<string>(),

    loadFeed: async (userId, reset = false) => {
        const state = get();
        if (state.isLoading) return;

        try {
            set({ isLoading: true });
            const offset = reset ? 0 : state.posts.length;

            const { data, error } = await supabase.rpc('get_feed', {
                p_user_id: userId,
                p_limit: PAGE_SIZE,
                p_offset: offset,
            });

            if (error) throw error;

            const newPosts = data || [];
            set({
                posts: reset ? newPosts : [...state.posts, ...newPosts],
                hasMore: newPosts.length === PAGE_SIZE,
                isLoading: false,
            });
        } catch (error) {
            console.error('Failed to load feed:', error);
            set({ isLoading: false });
        }
    },

    reactToPost: async (userId, postId, reaction) => {
        const state = get();
        const currentReaction = state.userReactions[postId];

        // Optimistic update
        const newReactions = { ...state.userReactions };
        const postIdx = state.posts.findIndex((p: any) => p.id === postId);
        const updatedPosts = [...state.posts];

        if (postIdx !== -1) {
            const post = { ...updatedPosts[postIdx], reactions: { ...updatedPosts[postIdx].reactions } };

            if (currentReaction === reaction) {
                // Remove reaction
                post.reactions[reaction] = Math.max(0, (post.reactions[reaction] || 0) - 1);
                delete newReactions[postId];
            } else {
                // Remove old reaction if exists
                if (currentReaction) {
                    post.reactions[currentReaction] = Math.max(0, (post.reactions[currentReaction] || 0) - 1);
                }
                // Add new reaction
                post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
                newReactions[postId] = reaction;
            }

            updatedPosts[postIdx] = post;
            set({ posts: updatedPosts, userReactions: newReactions });
        }

        try {
            if (currentReaction === reaction) {
                // Delete reaction
                await supabase
                    .from('reactions')
                    .delete()
                    .eq('user_id', userId)
                    .eq('post_id', postId);
            } else if (currentReaction) {
                // Update existing reaction
                await supabase
                    .from('reactions')
                    .update({ type: reaction })
                    .eq('user_id', userId)
                    .eq('post_id', postId);
            } else {
                // Insert new reaction
                await supabase
                    .from('reactions')
                    .insert({ user_id: userId, post_id: postId, type: reaction });
            }
        } catch (error) {
            console.error('Failed to react to post:', error);
            // Revert optimistic update on error
            set({ posts: state.posts, userReactions: state.userReactions });
        }
    },

    bookmarkPost: async (userId, postId) => {
        const state = get();
        const isCurrentlyBookmarked = state.bookmarks.has(postId);
        const newBookmarks = new Set(state.bookmarks);

        // Optimistic update
        if (isCurrentlyBookmarked) {
            newBookmarks.delete(postId);
        } else {
            newBookmarks.add(postId);
        }
        set({ bookmarks: newBookmarks });

        try {
            if (isCurrentlyBookmarked) {
                await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', userId)
                    .eq('post_id', postId);
            } else {
                await supabase
                    .from('bookmarks')
                    .insert({ user_id: userId, post_id: postId });
            }
            return !isCurrentlyBookmarked;
        } catch (error) {
            console.error('Failed to bookmark post:', error);
            // Revert
            set({ bookmarks: state.bookmarks });
            return isCurrentlyBookmarked;
        }
    },

    addPost: async (post) => {
        try {
            // Enforce text limit
            const content = post.content?.slice(0, TEXT_LIMIT) || '';
            const { data, error } = await supabase
                .from('posts')
                .insert({ ...post, content })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                set((s) => ({ posts: [data, ...s.posts] }));
            }
        } catch (error) {
            console.error('Failed to add post:', error);
            throw error;
        }
    },

    addComment: async (postId, userId, content) => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({ post_id: postId, user_id: userId, content })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                set((s) => ({
                    posts: s.posts.map((p: any) =>
                        p.id === postId
                            ? {
                                  ...p,
                                  comments: [...(p.comments || []), data],
                                  comment_count: (p.comment_count || 0) + 1,
                              }
                            : p
                    ),
                }));
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
            throw error;
        }
    },
}));
