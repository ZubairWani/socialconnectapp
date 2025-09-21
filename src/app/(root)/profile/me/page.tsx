"use client";

import { useState, useEffect } from "react";
import { ProfileHeader, ProfileUser } from "@/components/profile/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { Post } from "@/types"; 
import { FeedList } from "@/components/feed/FeedList"; 
import Loader from "@/components/Global/Loader";

export default function MyProfilePage() {
  const { user, isLoading: isUserLoading, isError: isUserError } = useUser();
  
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isErrorPosts, setIsErrorPosts] = useState(false);

  useEffect(() => {
   
    if (user) {
      const fetchUserPosts = async () => {
        try {
          setIsLoadingPosts(true);
          setIsErrorPosts(false);
          const response = await fetch(`/api/users/${user.id}/posts`);
          if (!response.ok) {
            throw new Error("Failed to fetch user's posts.");
          }
          const data: Post[] = await response.json();
          setPosts(data);
        } catch (error) {
          console.error(error);
          setIsErrorPosts(true);
        } finally {
          setIsLoadingPosts(false);
        }
      };

      fetchUserPosts();
    }
  }, [user]); 

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  if (isUserLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  if (isUserError || !user) {
    return <p className="text-center text-destructive p-8">Could not load your profile. Please try again.</p>;
  }

  const displayUser: ProfileUser = {
    ...user,
    name: `${user.firstName} ${user.lastName}`,
    joined: new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
  };

  return (
    <div>
      <ProfileHeader user={displayUser} isOwnProfile={true} />
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-around rounded-none border-b">
          <TabsTrigger value="posts" className="flex-1">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">Replies</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <FeedList
            posts={posts}
            isLoading={isLoadingPosts}
            isError={isErrorPosts}
            onPostDeleted={handlePostDeleted}
            currentUserId={user.id}
          />
        </TabsContent>
        <TabsContent value="replies">
          <p className="p-4 text-center text-muted-foreground">You haven't replied to any posts yet.</p>
        </TabsContent>
        <TabsContent value="likes">
          <p className="p-4 text-center text-muted-foreground">You haven't liked any posts yet.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}