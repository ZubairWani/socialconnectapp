/**
 * A lean representation of a user, typically used when nesting user data
 * inside other types like posts or comments to avoid circular dependencies.
 */
export type Author = {
  id: string;
  username: string;
  name: string; // A combination of firstName and lastName
  avatarUrl: string | null;
};

/**
 * Represents a complete User profile, mirroring the data fetched from `/api/users/me`
 * or `/api/users/{userId}`.
 */
export type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'User' | 'Admin';
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  createdAt: string; // Dates are serialized as strings in JSON
  followersCount: number;
  followingCount: number;
  postsCount: number;
};

/**

 * Represents a Post, including its author and interaction counts.
 */
export type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  category: 'general' | 'announcement' | 'question';
  createdAt: string;
  updatedAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean; // An optional field added by the API to indicate the current user's interaction
};

/**
 * Represents a Comment on a Post.
 */
export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  post: { id: string }; // We only need a reference to the parent post's ID
};

/**
 * Represents a Notification for a user.
 */
export type Notification = {
  id: string;
  type: 'Follow' | 'Like' | 'Comment';
  isRead: boolean;
  createdAt: string;
  sender: {
    username: string;
    avatarUrl: string | null;
  };
  postId: string | null;
  // This new field will be included by our updated API
  post: {
    content: string;
  } | null;
};