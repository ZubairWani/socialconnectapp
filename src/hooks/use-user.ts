"use client";

import { useState, useEffect } from 'react';
import { User as FullUserProfile } from '@/types'; 

interface UseUserReturn {
  user: FullUserProfile | null;
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}


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
      
      const data: any = await response.json();

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