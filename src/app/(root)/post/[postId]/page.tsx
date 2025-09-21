
// src/app/post/[postId]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/post/CommentSection";
import { Spinner } from "@/components/shared/Spinner";
import { LikeButton } from "@/components/post/LikeButton";
import type { Post } from "@/types";

// Types
type PostWithLikeStatus = Post & { isLiked: boolean };

interface PostStats {
  likeCount: number;
  commentCount: number;
}

interface LikeToggleData {
  isLiked: boolean;
  likeCount: number;
}

// Constants
const LOADING_STATES = {
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success'
} as const;

type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES];

// Custom hooks
function usePostData(postId: string) {
  const [post, setPost] = useState<PostWithLikeStatus | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LOADING_STATES.LOADING);

  const fetchPost = useCallback(async () => {
    if (!postId) return;

    try {
      setLoadingState(LOADING_STATES.LOADING);
      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const data = await response.json();

      // Normalize author name
      data.author.name = `${data.author.firstName} ${data.author.lastName}`;

      setPost(data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const updatePost = useCallback((updates: Partial<PostWithLikeStatus>) => {
    setPost(current => current ? { ...current, ...updates } : null);
  }, []);

  return {
    post,
    loadingState,
    updatePost,
    refetch: fetchPost
  };
}

// Sub-components
function PostHeader() {
  return (
    <header className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <h2 className="text-xl font-bold">Post</h2>
    </header>
  );
}

interface PostContentProps {
  post: PostWithLikeStatus;
}

function PostContent({ post }: PostContentProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Author Info */}
      <div className="flex gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={post.author.avatarUrl || undefined} alt={`${post.author.name}'s avatar`} />
          <AvatarFallback className="text-lg">{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">{post.author.name}</p>
          <p className="text-sm text-muted-foreground truncate">@{post.author.username}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <p className="text-xl leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden border bg-muted">
            <img
              className="w-full h-auto max-h-96 object-cover"
              src={post.imageUrl}
              alt="Post attachment"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Timestamp */}
      <time
        className="text-sm text-muted-foreground block pt-2"
        dateTime={post.createdAt}
        title={format(new Date(post.createdAt), "EEEE, MMMM do, yyyy 'at' h:mm a")}
      >
        {format(new Date(post.createdAt), "h:mm a · MMM d, yyyy")}
      </time>
    </div>
  );
}

interface PostStatsProps {
  stats: PostStats;
}

function PostStats({ stats }: PostStatsProps) {
  return (
    <div className="px-4 py-3 flex gap-6 text-sm border-b bg-muted/30">
      <div className="flex gap-1">
        <span className="font-semibold tabular-nums">{stats.likeCount.toLocaleString()}</span>
        <span className="text-muted-foreground">
          {stats.likeCount === 1 ? 'Like' : 'Likes'}
        </span>
      </div>
      <div className="flex gap-1">
        <span className="font-semibold tabular-nums">{stats.commentCount.toLocaleString()}</span>
        <span className="text-muted-foreground">
          {stats.commentCount === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>
    </div>
  );
}

interface PostActionsProps {
  post: PostWithLikeStatus;
  onLikeToggle: (data: LikeToggleData) => void;
}

function PostActions({ post, onLikeToggle }: PostActionsProps) {
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `Post by ${post.author.name}`,
      text: post.content.slice(0, 100) + (post.content.length > 100 ? '...' : ''),
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
 
      try {
        await navigator.clipboard.writeText(window.location.href);
      
        console.log('Link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  }, [post.author.name, post.content]);

  return (
    <div className="flex justify-around p-3 border-b bg-background">
      <LikeButton
        postId={post.id}
        initialIsLiked={post.isLiked}
        initialLikeCount={post.likeCount}
        onLikeToggle={onLikeToggle}
      />
      <Button variant="ghost" size="sm" onClick={handleShare} className="flex-1 max-w-32">
        <Send className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading post...</p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
      <div className="text-6xl">😕</div>
      <h3 className="text-lg font-semibold">Post not found</h3>
      <p className="text-muted-foreground max-w-md">
        This post could not be loaded or does not exist. It may have been deleted or you may not have permission to view it.
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        Go back
      </Button>
    </div>
  );
}

// Main component
export default function SinglePostPage() {
  const params = useParams();
  const postId = params.postId as string;
  const { post, loadingState, updatePost } = usePostData(postId);

  // Event handlers
  const handleLikeToggle = useCallback((newLikeState: LikeToggleData) => {
    updatePost(newLikeState);
  }, [updatePost]);

  const handleCommentAdded = useCallback(() => {
    updatePost({ commentCount: (post?.commentCount || 0) + 1 });
  }, [post?.commentCount, updatePost]);

  const handleCommentDeleted = useCallback(() => {
    // Decrement the comment count when a comment is deleted
    updatePost({ commentCount: (post?.commentCount || 0) - 1 });
  }, [post?.commentCount, updatePost]);

  // Render loading state
  if (loadingState === LOADING_STATES.LOADING) {
    return (
      <div className="max-w-2xl mx-auto">
        <PostHeader />
        <LoadingState />
      </div>
    );
  }

  // Render error state
  if (loadingState === LOADING_STATES.ERROR || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <PostHeader />
        <ErrorState />
      </div>
    );
  }

  // Render success state
  return (
    <div className="max-w-2xl mx-auto bg-background min-h-screen pb-4">
      <PostHeader />

      <main className="divide-y">
        <PostContent post={post} />

        <PostStats stats={{ likeCount: post.likeCount, commentCount: post.commentCount }} />

        <PostActions post={post} onLikeToggle={handleLikeToggle} />

        <CommentSection
          postId={postId}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      </main>
    </div>
  );
}