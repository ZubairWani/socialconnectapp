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

  // This handler is called by ImageUpload when the Supabase upload is complete.
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
        <Button variant="outline" className="w-full sm:w-auto">
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <DialogHeader className="space-y-2 sm:space-y-3">
              <DialogTitle className="text-lg sm:text-xl">Edit profile</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">Profile Picture</FormLabel>
              <div className="flex justify-center sm:justify-start">
                <ImageUpload
                  bucket="posts"
                  preview={avatarPreview}
                  setPreview={setAvatarPreview}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              <FormField 
                control={form.control} 
                name="bio" 
                render={({ field }) => (
                  <FormItem className="space-y-1 sm:space-y-2">
                    <FormLabel className="text-sm font-medium">Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="min-h-[80px] sm:min-h-[100px] text-sm resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="location" 
                render={({ field }) => (
                  <FormItem className="space-y-1 sm:space-y-2">
                    <FormLabel className="text-sm font-medium">Location</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="text-sm h-9 sm:h-10"
                        placeholder="Where are you located?"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="website" 
                render={({ field }) => (
                  <FormItem className="space-y-1 sm:space-y-2">
                    <FormLabel className="text-sm font-medium">Website</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="text-sm h-9 sm:h-10"
                        placeholder="https://your-website.com"
                        type="url"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} 
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto text-sm h-9 sm:h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || isSavingAvatar}
                className="w-full sm:w-auto text-sm h-9 sm:h-10"
              >
                {form.formState.isSubmitting || isSavingAvatar ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}