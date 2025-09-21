
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowButton } from "@/components/profile/FollowButton"; // Import the new component

// Define a type for the user suggestions
type SuggestedUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
};

/**
 * Renders a skeleton placeholder for the suggestion list while loading.
 */
function SuggestionSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * The right-hand panel for the main application layout.
 *
 * Contains a search bar and a dynamically fetched "Who to follow" suggestion card.
 */
function RightPanel() {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/suggestions');
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // When a user is followed, remove them from the list and fetch a new set
  const handleFollowSuccess = (followedUserId: string) => {
    setSuggestions(prev => prev.filter(user => user.id !== followedUserId));
    // Optional: You could fetch one new user to replace the one just followed
    // for a more dynamic feel, or just refetch the whole list.
    // fetchSuggestions();
  };

  return (
    <aside className="hidden lg:block p-6 sticky top-0 h-screen">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-full bg-muted pl-10"
        />
      </div>

      {/* "Who to follow" Card */}
      <Card>
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SuggestionSkeleton />
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || ''} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-bold hover:underline">
                        <Link href={`/profile/${user.id}`}>
                          {user.firstName} {user.lastName}
                        </Link>
                      </p>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <FollowButton
                    userIdToFollow={user.id}
                    initialIsFollowing={false}
                    onFollowStateChange={() => handleFollowSuccess(user.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No new suggestions right now.
            </p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}

export default RightPanel;