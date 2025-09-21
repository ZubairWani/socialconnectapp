import * as z from 'zod';

// =================================================================
// AUTHENTICATION SCHEMAS
// =================================================================

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must not exceed 30 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required."),
  password: z.string().min(1, "Password is required."),
});

// =================================================================
// USER & PROFILE SCHEMAS
// =================================================================

export const updateProfileSchema = z.object({
  bio: z.string().max(160, "Bio cannot be longer than 160 characters.").optional(),
  location: z.string().max(50, "Location cannot be longer than 50 characters.").optional(),
  website: z.string().url("Please enter a valid URL.").or(z.literal("")).optional(), // Allow empty string or valid URL
  avatarUrl: z.string().url("Invalid URL.").nullable().optional(), 
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// =================================================================
// POST & CONTENT SCHEMAS
// =================================================================

export const postSchema = z.object({
  content: z.string()
    .min(1, { message: "Post content cannot be empty." })
    .max(280, { message: "Post cannot exceed 280 characters." }),
  category: z.enum(['general', 'announcement', 'question']).default('general'),
  // image_url is handled separately during upload, not part of this form schema
});

export const commentSchema = z.object({
    content: z.string()
        .min(1, { message: "Comment cannot be empty." })
        .max(200, { message: "Comment cannot exceed 200 characters." }),
});