"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { X, UploadCloud } from 'lucide-react';
import { Spinner } from './Spinner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  // We'll add a 'bucket' prop to make the component more reusable (e.g., 'posts' or 'avatars')
  bucket: string;
  setPreview: (string | null);
  preview: (string | null);
}

export function ImageUpload({ onUploadComplete, bucket, setPreview, preview }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient(); // 2. Initialize the Supabase client

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 3. Implement real client-side validation
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Maximum size is 2MB.");
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert("Invalid file type. Please upload a JPEG or PNG image.");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);
    setIsUploading(true);

    try {
      // 4. --- REAL UPLOAD TO SUPABASE STORAGE ---
      // Create a unique file path to prevent overwriting files with the same name
      const filePath = `${bucket}/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }
      console.log(data)
      console.log(error)
      // 5. Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      // Notify the parent component that the upload is complete with the new URL
      onUploadComplete(publicUrl);
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Please try again.");
      setPreview(null); // Clear preview on error
      onUploadComplete(""); // Notify parent of failure
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    // Note: This only removes the image from the UI. 
    // A robust implementation would also delete the file from Supabase Storage.
    setPreview(null);
    onUploadComplete(""); // Notify parent that the image URL is now empty
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png"
      />
      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border">
          <Image src={preview} alt="Image preview" width={500} height={300} className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploading ? (
                <Spinner />
            ) : (
                <Button variant="destructive" size="icon" onClick={removeImage}>
                    <X className="h-5 w-5" />
                </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
            <UploadCloud className="h-8 w-8 mb-2" />
            <p className="text-sm font-semibold">Click to upload an image</p>
            <p className="text-xs">PNG, JPG (Max 2MB)</p>
        </div>
      )}
    </div>
  );
}