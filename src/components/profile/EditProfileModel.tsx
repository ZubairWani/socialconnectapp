
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { updateProfileSchema, UpdateProfileData } from "@/lib/validators";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { ImageUpload } from "@/components/shared/ImageUpload"; 

// Define the shape of the user prop
type ProfileUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
};

export function EditProfileModal({ user }: { user: ProfileUser }) {
  const [open, setOpen] = useState(false);
  const { mutate } = useUser();

  // 2. State for the avatar preview, controlled by the parent as required by your ImageUpload component
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    },
  });

  // 3. This handler is called by ImageUpload when the Supabase upload is complete.
  // Its job is to save the new URL to our own database.
  const handleUploadComplete = async (url: string) => {
    // An empty URL means the user removed the image.
    
    const newAvatarUrl = url === "" ? null : url;

    setIsSavingAvatar(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });

      if (!response.ok) throw new Error('Failed to update profile with new avatar.');

      toast.success(newAvatarUrl ? "Avatar updated successfully!" : "Avatar removed.");
      mutate(); // Re-fetch user data across the app to show the new avatar
      window.location.reload()
    } catch (error) {
      toast.error("Failed to save new avatar. Please try again.");
     
      setAvatarPreview(user.avatarUrl);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const onSubmit = async (values: UpdateProfileData) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to update profile.');

      toast.success("Profile updated successfully!");
      mutate();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <FormLabel>Profile Picture</FormLabel>
              <ImageUpload
                bucket="posts"
                preview={avatarPreview}
                setPreview={setAvatarPreview}
                onUploadComplete={handleUploadComplete}
              />
            </div>

            <div className="grid gap-4">
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isSavingAvatar}>
                {form.formState.isSubmitting || isSavingAvatar ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}