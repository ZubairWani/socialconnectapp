"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { ImageUpload } from "../shared/ImageUpload";
import { Post } from "@/types";

type CurrentUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

type Props = {
  currentUser: CurrentUser; 
  onPostCreated: (newPost: Post) => void;
};

const getInitials = (user: CurrentUser): string => {
  const { firstName, lastName, username } = user;
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  return "ME";
};


export function CreatePostForm({ currentUser, onPostCreated }: Props) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
   
    const handleUploadComplete = (url: string) => {
        setImageUrl(url);
    };

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsSubmitting(true);
        const payload = { content, imageUrl };

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to create post.");

            const newPost = await response.json(); 
            onPostCreated(newPost);

            setContent('');
            setImageUrl(null);
            setPreview(null);
        } catch (error) {
            console.error(error);
            // TODO: Show error toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 border-b">
            <div className="flex gap-4">
                <Avatar>
                    {/* Use the logged-in user's avatarUrl */}
                    <AvatarImage src={currentUser.avatarUrl || ''} />
                    {/* Fallback to user's initials */}
                    <AvatarFallback>{getInitials(currentUser)}</AvatarFallback>
                </Avatar>
                
                <div className="w-full space-y-3">
                    <Textarea 
                        placeholder="What's happening?" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                    />
                    
                    <ImageUpload preview={preview} setPreview={setPreview} bucket="posts"  onUploadComplete={handleUploadComplete} />

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}