// //src/components/profile/
// "use client";

// import { useState } from "react";
// import { Button } from "../ui/button";
// import { Spinner } from "../shared/Spinner";

// interface FollowButtonProps {
//   targetUserId: string;
//   isInitiallyFollowing: boolean;
// }

// export function FollowButton({ targetUserId, isInitiallyFollowing }: FollowButtonProps) {
//   const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleFollow = async () => {
//     setIsLoading(true);

//     // Optimistic UI update
//     setIsFollowing(true); 

//     try {
//       const response = await fetch(`/api/users/${targetUserId}/follow`, {
//         method: 'POST',
//       });
//       if (!response.ok) {
//         // If the request fails, revert the UI state
//         setIsFollowing(false);
//         throw new Error("Failed to follow user.");
//       }
//     } catch (error) {
//       console.error(error);
//       setIsFollowing(false); // Revert on error
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUnfollow = async () => {
//     setIsLoading(true);

//     // Optimistic UI update
//     setIsFollowing(false);

//     try {
//       const response = await fetch(`/api/users/${targetUserId}/follow`, {
//         method: 'DELETE',
//       });
//       if (!response.ok) {
//         // If the request fails, revert the UI state
//         setIsFollowing(true);
//         throw new Error("Failed to unfollow user.");
//       }
//     } catch (error) {
//       console.error(error);
//       setIsFollowing(true); // Revert on error
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isFollowing) {
//     return (
//       <Button variant="outline" onClick={handleUnfollow} disabled={isLoading}>
//         {isLoading ? <Spinner size="sm" /> : "Following"}
//       </Button>
//     );
//   }

//   return (
//     <Button onClick={handleFollow} disabled={isLoading}>
//       {isLoading ? <Spinner size="sm" /> : "Follow"}
//     </Button>
//   );
// }


"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';

interface FollowButtonProps {
  userIdToFollow: string;
  initialIsFollowing: boolean;
  onFollowStateChange?: () => void; 
}

export function FollowButton({ userIdToFollow, initialIsFollowing, onFollowStateChange }: FollowButtonProps) {
  const { user: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A user cannot follow themselves
  if (currentUser?.id === userIdToFollow) {
    return null;
  }

  const handleFollow = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${userIdToFollow}/follow`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to follow.');
      setIsFollowing(true);
      toast.success('User followed!');
      if (onFollowStateChange) onFollowStateChange();
    } catch (error) {
      toast.error('Could not follow user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnfollow = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${userIdToFollow}/follow`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to unfollow.');
      setIsFollowing(false);
      toast.success('User unfollowed!');
      if (onFollowStateChange) onFollowStateChange();
    } catch (error) {
      toast.error('Could not unfollow user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnfollow}
        disabled={isSubmitting}
      >
        {isSubmitting ? '...' : 'Unfollow'}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleFollow} disabled={isSubmitting}>
      {isSubmitting ? '...' : 'Follow'}
    </Button>
  );
}