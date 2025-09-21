
"use client";

import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { Button } from "@/components/ui/button";

type Post = React.ComponentProps<typeof PostCard>['post'];

interface FeedListProps {
  posts: Post[];
  isInitialLoading: boolean; 
  isError: boolean;
  onPostDeleted: (postId: string) => void;
  onPostUpdate: (updatedPost: Post) => void;
  currentUserId?: string;

  // --- NEW PROPS FOR PAGINATION ---
  hasMore: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function FeedList({
  posts,
  isInitialLoading,
  isError,
  onPostDeleted,
  onPostUpdate, 
  currentUserId,
  hasMore,
  isFetchingNextPage,
  onLoadMore
}: FeedListProps) {
  if (isInitialLoading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-center text-destructive p-8">Failed to load feed. Please try again.</p>;
  }

  if (!isInitialLoading && posts.length === 0) {
    return <p className="text-center text-muted-foreground p-8">Your feed is empty. Follow some users to see their posts!</p>;
  }

  return (
    <div>
      <div className="divide-y p-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdate={onPostUpdate} 
            onPostDeleted={onPostDeleted}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      <div className="flex justify-center py-8">
        {hasMore ? (
          <Button onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        ) : (
          <p className="text-muted-foreground">You've reached the end! 🎉</p>
        )}
      </div>
    </div>
  );
}