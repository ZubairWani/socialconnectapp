"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Notification } from "@/types";

/**
 * A helper component to render the correct icon for each notification type.
 */
const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'Like':
      return <Heart className="h-6 w-6 text-red-500" />;
    case 'Comment':
      return <MessageCircle className="h-6 w-6 text-blue-500" />;
    case 'Follow':
      return <UserPlus className="h-6 w-6 text-green-500" />;
    default:
      return null;
  }
};

/**
 * A helper component to render a single, actionable notification item.
 */
function NotificationItem({ notification }: { notification: Notification }) {
  let message = '';
  let href = '#';

  switch (notification.type) {
    case 'Like':
      message = 'liked your post.';
      href = `/post/${notification.postId}`;
      break;
    case 'Comment':
      message = 'commented on your post.';
      href = `/post/${notification.postId}`;
      break;
    case 'Follow':
      message = 'started following you.';
      href = `/profile/${notification.sender.username}`;
      break;
  }

  return (
    <Link href={href} className={`p-4 flex gap-4 items-start hover:bg-muted/50 ${!notification.isRead ? 'bg-primary/10' : ''}`}>
      <NotificationIcon type={notification.type} />
      <div className="flex-1">
        <Avatar className="mb-2 h-8 w-8">
          <AvatarImage src={notification.sender.avatarUrl || ''} />
          <AvatarFallback>{notification.sender.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <p>
          <span className="font-bold">{notification.sender.username}</span>
          <span className="text-muted-foreground"> {message}</span>
        </p>
        {notification.post?.content && (
          <p className="text-sm text-muted-foreground mt-1 border-l-2 pl-2 italic truncate">
            "{notification.post.content}"
          </p>
        )}
      </div>
    </Link>
  );
}

/**
 * The main page for displaying all user notifications.
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notifications?limit=30');
        if (!response.ok) throw new Error('Failed to fetch notifications.');

        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-sm">
        <h2 className="text-xl font-bold">Notifications</h2>
      </header>

      {isLoading ? (
        <div className="p-4 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="divide-y">
          {notifications.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
      ) : (
        <p className="p-8 text-center text-muted-foreground">
          You have no notifications yet.
        </p>
      )}
    </div>
  );
}