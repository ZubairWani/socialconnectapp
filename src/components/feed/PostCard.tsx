
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LikeButton } from "@/components/post/LikeButton";
import { CommentDialog } from "@/components/post/CommentDialog";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  onPostUpdate: (updatedPost: Post) => void;
  onPostDeleted: (postId: string) => void;
  currentUserId?: string;
}

export function PostCard({ post, onPostUpdate, onPostDeleted, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = currentUserId && currentUserId === post.author.id;

  const handleLikeToggle = (newLikeState: { isLiked: boolean; likeCount: number }) => {
    onPostUpdate({ ...post, ...newLikeState });
  };

  const handleCommentCreated = () => {
    onPostUpdate({ ...post, commentCount: post.commentCount + 1 });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete the post.');
      toast.success("Post deleted successfully!");
      onPostDeleted(post.id);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="rounded-none border-x-0 border-t-0 first:border-t hover:bg-muted/50 transition-colors duration-200">
      <div onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar>
              <AvatarImage src={post.author.avatarUrl || ''} />
              <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2 flex-wrap">
                <Link href={`/profile/${post.author.id}`} className="font-bold hover:underline">
                  {post.author.name}
                </Link>
                <span className="text-sm text-muted-foreground truncate">
                  @{post.author.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>

              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ConfirmationDialog
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      }
                      title="Are you sure you want to delete this post?"
                      description="This action cannot be undone."
                      onConfirm={handleDelete}
                      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                      isDestructive
                      disabled={isDeleting}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
      </div>

      <div onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
        <CardContent className="py-0">
          <p className="whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <div className="mt-4">
              <img className="object-contain w-full h-auto max-h-96 rounded-2xl border" src={post.imageUrl} alt="Post content" />
            </div>
          )}
        </CardContent>
      </div>
      
      <div onClick={(e) => e.stopPropagation()}>
        <CardFooter className="flex items-center gap-4 pt-4">
          <LikeButton
            postId={post.id}
            initialIsLiked={post.isLiked}
            initialLikeCount={post.likeCount}
            onLikeToggle={handleLikeToggle}
          />
          <CommentDialog postId={post.id} onCommentCreated={handleCommentCreated}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              <span>{post.commentCount}</span>
            </Button>
          </CommentDialog>
        </CardFooter>
      </div>
    </Card>
  );
}