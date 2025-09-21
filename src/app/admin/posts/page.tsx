

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Skeleton } from "@/components/ui/skeleton";

type Post = {
  id: string;
  authorName: string;
  authorUsername: string;
  content: string;
  category: string;
  createdAt: string;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/posts');
        if (!response.ok) throw new Error("Failed to fetch posts.");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load post data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete the post.');

      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      toast.success("Post deleted successfully.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <CardDescription>Oversee and manage all posts on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                </TableRow>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">{post.authorName}</div>
                    <div className="text-sm text-muted-foreground">@{post.authorUsername}</div>
                  </TableCell>
                  <TableCell className="max-w-sm truncate">{post.content}</TableCell>
                  <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                  <TableCell>{post.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/post/${post.id}`}>View Post</Link>
                        </DropdownMenuItem>
                        <ConfirmationDialog
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                              Delete Post
                            </DropdownMenuItem>
                          }
                          title="Are you sure you want to delete this post?"
                          description="This action cannot be undone and will permanently remove the post."
                          onConfirm={() => handleDeletePost(post.id)}
                          confirmText="Delete"
                          isDestructive
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No posts found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}