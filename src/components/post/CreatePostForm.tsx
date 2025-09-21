"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { ImageUpload } from "../shared/ImageUpload";
import { Post } from "@/types";

type Props = {
  onPostCreated: (newPost: Post) => void;
};

export function CreatePostForm({ onPostCreated }: Props) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
   
    // This function will be called by the ImageUpload component when an upload is complete
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

    const newPost = await response.json(); // backend should return the created post

    // ✅ Inform parent (FeedPage) about the new post
    onPostCreated(newPost);

    // Reset form
    setContent('');
    setImageUrl(null);
    setPreview(null)

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
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="w-full space-y-3">
                    <Textarea 
                        placeholder="What's happening?" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                    />
                    
                    {/* INTEGRATION POINT: The ImageUpload component is added here */}
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