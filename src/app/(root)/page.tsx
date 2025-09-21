
"use client";

import { CreatePostForm } from "@/components/post/CreatePostForm";
import { FeedList } from "@/components/feed/FeedList";
import { useUser } from "@/hooks/use-user";
import { useFeed } from "@/hooks/use-feed";

export default function FeedPage() {
  const {
    posts,
    isInitialLoading,
    error,
    hasMore,
    isFetchingNextPage,
    loadMore,
    deletePost,
    updatePost,
    prependPost
  } = useFeed();

  const { user, isLoading: isUserLoading } = useUser();

  return (
    <div>
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-sm">
        <h2 className="text-xl font-bold">
          Welcome! {isUserLoading ? "..." : user?.firstName}
        </h2>
      </header>

      <CreatePostForm onPostCreated={prependPost} />

      <FeedList
        posts={posts}
        isInitialLoading={isInitialLoading || isUserLoading}
        isError={!!error}
        onPostDeleted={deletePost}
        onPostUpdate={updatePost}
        currentUserId={user?.id}
        hasMore={hasMore}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={loadMore}
      />
    </div>
  );
}