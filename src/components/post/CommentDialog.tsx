"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const commentSchema = z.object({
    content: z.string().min(1, "Comment can't be empty").max(280),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentDialogProps {
    postId: string;
    onCommentCreated: () => void; // Callback to notify parent of new comment
    children: React.ReactNode; // The trigger button
}

export function CommentDialog({ postId, onCommentCreated, children }: CommentDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<CommentFormData>({
        resolver: zodResolver(commentSchema),
        defaultValues: { content: '' },
    });

    const onSubmit = async (data: CommentFormData) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment.');
            }

            toast.success('Comment posted!');
            onCommentCreated();
            form.reset();
            setOpen(false);
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a comment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="Post your reply" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Replying...' : 'Reply'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}