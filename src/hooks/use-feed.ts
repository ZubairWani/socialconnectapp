"use client";

import { useState, useCallback, useEffect } from 'react';
import { Post } from "@/types";

const FEED_LIMIT = 10;

export function useFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchFeed = useCallback(async (pageNum: number) => {
        if (pageNum === 1) {
            setIsInitialLoading(true);
        } else {
            setIsFetchingNextPage(true);
        }
        setError(null);

        try {
            const response = await fetch(`/api/feed?page=${pageNum}&limit=${FEED_LIMIT}`);
            if (!response.ok) throw new Error("Failed to fetch feed");

            const newPosts: Post[] = await response.json();

            setPosts(prev => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
            setHasMore(newPosts.length === FEED_LIMIT);
        } catch (err) {
            setError(err as Error);
        } finally {
            if (pageNum === 1) {
                setIsInitialLoading(false);
            } else {
                setIsFetchingNextPage(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchFeed(1);
    }, [fetchFeed]);

    const loadMore = () => {
        if (hasMore && !isFetchingNextPage) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchFeed(nextPage);
        }
    };

    const deletePost = (postId: string) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    const updatePost = (updatedPost: Post) => {
        setPosts(prev =>
            prev.map(post => (post.id === updatedPost.id ? updatedPost : post))
        );
    };

    const prependPost = (newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
    };

    return {
        posts,
        isInitialLoading,
        error,
        hasMore,
        isFetchingNextPage,
        loadMore,
        deletePost,
        updatePost,
        prependPost
    };
}