"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    postId: string;
    initialIsLiked: boolean;
    initialLikeCount: number;
    onLikeToggle: (newLikeState: { isLiked: boolean; likeCount: number }) => void;
}

export function LikeButton({
    postId,
    initialIsLiked,
    initialLikeCount,
    onLikeToggle,
}: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLikeToggle = async () => {
        setIsSubmitting(true);
        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;

        // Optimistic UI update
        const newLikedState = !isLiked;
        const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
        setIsLiked(newLikedState);
        setLikeCount(newLikeCount);
        onLikeToggle({ isLiked: newLikedState, likeCount: newLikeCount });

        try {
            const method = newLikedState ? 'POST' : 'DELETE';
            const response = await fetch(`/api/posts/${postId}/like`, { method });
            if (!response.ok) {
                throw new Error("Failed to update like status");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            // Revert on failure
            setIsLiked(originalIsLiked);
            setLikeCount(originalLikeCount);
            onLikeToggle({ isLiked: originalIsLiked, likeCount: originalLikeCount });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground"
            onClick={handleLikeToggle}
            disabled={isSubmitting}
        >
            <Heart
                className={cn("h-5 w-5", {
                    "text-red-500 fill-red-500": isLiked,
                })}
            />
            <span>{likeCount}</span>
        </Button>
    );
}