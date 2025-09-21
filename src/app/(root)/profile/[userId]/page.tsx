"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/shared/Spinner";
import { useUser } from "@/hooks/use-user"; 
import { FeedList } from "@/components/feed/FeedList";

type ProfileUser = React.ComponentProps<typeof ProfileHeader>['user'];

export default function UserProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useUser();

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

       
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch profile data.');
        }

        const userData = await response.json();
        console.log("ud: ", userData)
        
        const formattedUser = {
          ...userData,
          name: `${userData.firstName} ${userData.lastName}`,
          joined: new Date(userData.createdAt).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
       
          followersCount: userData.followers.length,
          followingCount: userData.following.length,
        };

        setUser(formattedUser);

      } catch (error) {
        console.error(error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (isError || !user) {
    return <p className="text-center text-destructive p-8">This profile could not be loaded or does not exist.</p>;
  }

  const isOwnProfile = currentUser?.id === user.id;

 console.log(user.posts)  
  
  return (
    <div>
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={user.isFollowing}
      />

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-around rounded-none border-b">
          <TabsTrigger value="posts" className="flex-1">Posts ({user.posts.length})</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">Replies</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
                 
                 <FeedList
                   posts={user.posts}
                   currentUserId={user.id}
                 />
               </TabsContent>
        <TabsContent value="replies">
          <p className="p-4 text-center text-muted-foreground">@{user.username} hasn't replied to any posts yet.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}