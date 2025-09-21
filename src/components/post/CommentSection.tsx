
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/hooks/use-user";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ConfirmationDialog } from "../shared/ConfirmationDialog";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    authorId: string;
    author: {
        name: string;
        username: string;
        avatarUrl: string | null;
    };
}

interface CommentSectionProps {
    postId: string;
    onCommentAdded: () => void;
    onCommentDeleted: () => void;
}

const commentSchema = z.object({
    content: z
        .string()
        .min(1, "Reply can't be empty")
        .max(280, "Reply must be 280 characters or less")
        .trim(),
});
type CommentFormData = z.infer<typeof commentSchema>;

const MAX_COMMENT_LENGTH = 280;

function useComments(postId: string) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/posts/${postId}/comments`);
            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${response.status}`);
            }
            const data = await response.json();
            setComments(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
            console.error('Error fetching comments:', err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = useCallback((newComment: Comment) => {
        setComments(prev => [newComment, ...prev]);
    }, []);

    const deleteComment = useCallback((commentId: string) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
    }, []);

    return { comments, isLoading, error, refetch: fetchComments, addComment, deleteComment };
}

function CommentForm({ postId, onCommentAdded }: { postId: string; onCommentAdded: (comment: Comment) => void; }) {
    const { user } = useUser();
    const form = useForm<CommentFormData>({
        resolver: zodResolver(commentSchema),
        defaultValues: { content: '' },
        mode: 'onChange',
    });
    const { watch, handleSubmit, register, reset, formState } = form;
    const { isSubmitting, errors } = formState;
    const watchedContent = watch('content');
    const remainingChars = MAX_COMMENT_LENGTH - (watchedContent?.length || 0);

    const onSubmit = useCallback(async (data: CommentFormData) => {
        if (!user) {
            toast.error('You must be logged in to reply');
            return;
        }
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Failed to post reply: ${response.status}`);
            }
            const newComment = await response.json();
            const fullAuthorComment = {
                ...newComment,
                authorId: user.id,
                author: {
                    name: `${user.firstName} ${user.lastName}`,
                    username: user.username,
                    avatarUrl: user.avatarUrl || null,
                }
            };
            onCommentAdded(fullAuthorComment);
            reset();
            toast.success('Reply posted successfully!');
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Failed to post reply. Please try again.');
        }
    }, [user, postId, onCommentAdded, reset]);

    if (!user) {
        return (
            <Card className="p-4 text-center">
                <p className="text-muted-foreground">Please log in to post a reply.</p>
            </Card>
        );
    }

    return (
        <div className="p-4 border-b bg-muted/20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={`${user.firstName}'s avatar`} />
                        <AvatarFallback>{user.firstName?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Post your reply"
                            className="min-h-[80px] resize-none"
                            {...register('content')}
                            disabled={isSubmitting}
                        />
                        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
                        <div className="flex items-center justify-between">
                            <span className={`text-xs ${remainingChars <= 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {remainingChars} characters remaining
                            </span>
                            <Button type="submit" size="sm" disabled={isSubmitting || !watchedContent?.trim() || remainingChars < 0}>
                                {isSubmitting ? 'Posting...' : 'Reply'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

function CommentSkeleton() {
    return (
        <div className="p-4 flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex gap-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /></div>
                <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
}

interface CommentItemProps {
    postId: string;
    comment: Comment;
    currentUserId?: string;
    onDelete: (commentId: string) => void;
}

function CommentItem({ postId, comment, currentUserId, onDelete }: CommentItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const isAuthor = currentUserId === comment.authorId;
    const timeAgo = useMemo(() => formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }), [comment.createdAt]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/posts/${postId}/comments/${comment.id}`, { method: 'DELETE' });
            
            if (!response.ok) throw new Error('Failed to delete comment.');
            toast.success('Comment deleted.');
            onDelete(comment.id);
        } catch (error) {
            toast.error('Could not delete comment. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <article className="p-4 flex gap-3 hover:bg-muted/50 transition-colors">
            <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={comment.author.avatarUrl || undefined} alt={`${comment.author.name}'s avatar`} />
                <AvatarFallback>{comment.author.name.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="font-semibold text-foreground truncate">{comment.author.name}</span>
                        <span className="text-muted-foreground truncate">@{comment.author.username}</span>
                        <span className="text-muted-foreground">·</span>
                        <time className="text-muted-foreground" dateTime={comment.createdAt}>{timeAgo}</time>
                    </div>
                    {isAuthor && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isDeleting}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <ConfirmationDialog
                                    trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </DropdownMenuItem>
                                    }
                                    title="Delete this comment?"
                                    description="This action cannot be undone."
                                    onConfirm={handleDelete}
                                    isDestructive
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
            </div>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="p-8 text-center text-muted-foreground">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm">No replies yet. Be the first to reply!</p>
        </div>
    );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="p-8 text-center space-y-3">
            <div className="text-4xl">⚠️</div>
            <p className="text-sm text-muted-foreground">Failed to load comments</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
        </div>
    );
}

export function CommentSection({ postId, onCommentAdded, onCommentDeleted }: CommentSectionProps) {
    const { user } = useUser();
    const { comments, isLoading, error, refetch, addComment, deleteComment } = useComments(postId);

    const handleCommentAdded = useCallback((comment: Comment) => {
        addComment(comment);
        onCommentAdded();
    }, [addComment, onCommentAdded]);

    const handleCommentDeleted = useCallback((commentId: string) => {
        deleteComment(commentId);
        onCommentDeleted();
    }, [deleteComment, onCommentDeleted]);

    return (
        <section className="bg-background" aria-label="Comments section">
            <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
            <div className="divide-y">
                {isLoading ? (
                    Array.from({ length: 3 }, (_, i) => <CommentSkeleton key={i} />)
                ) : error ? (
                    <ErrorState error={error} onRetry={refetch} />
                ) : comments.length === 0 ? (
                    <EmptyState />
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            postId={postId}
                            comment={comment}
                            currentUserId={user?.id}
                            onDelete={handleCommentDeleted}
                        />
                    ))
                )}
            </div>
        </section>
    );
}