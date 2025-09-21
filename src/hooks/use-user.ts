"use client";

import { useState, useEffect } from 'react';
import { User as FullUserProfile } from '@/types'; // 1. IMPORT the rich User type from our central types file

// We can simplify the local interface or remove it, but for clarity,
// let's define what this hook returns. It will match the FullUserProfile.
interface UseUserReturn {
  user: FullUserProfile | null;
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

/**
 * Custom hook to fetch and manage the currently authenticated user's data.
 * It fetches the complete profile from `/api/users/me` and provides loading/error states.
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<FullUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const response = await fetch('/api/users/me');

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }
      // 2. The API returns the full profile, including the _count object.
      // We type the response as `any` first to process it, then cast to our clean type.
      const data: any = await response.json();

      // 3. We format the data here, inside the hook, so components don't have to.
      // This is the single source of truth for user data formatting.
      const formattedUser: FullUserProfile = {
          ...data,
          followersCount: data._count.followers,
          followingCount: data._count.following,
          postsCount: data._count.posts,
      };

      setUser(formattedUser);
    } catch (error) {
      console.error("useUser fetch error:", error);
      setIsError(true);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const mutate = () => {
    fetchUser();
  };

  return { user, isLoading, isError, mutate };
}