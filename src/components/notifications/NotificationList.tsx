import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, UserPlus, MessageSquare } from "lucide-react";
import type { Notification } from "@/types"; 

function NotificationItem({ notification }: { notification: Notification }) {

    let icon, message, href;

    switch (notification.type) {
        case 'Like':
            icon = <Heart className="h-5 w-5 text-red-500" />;
            message = 'liked your post.';
            href = `/post/${notification.postId}`; 
            break;
        case 'Follow':
            icon = <UserPlus className="h-5 w-5 text-blue-500" />;
            message = 'started following you.';
            href = `/profile/${notification.sender.username}`; 
            break;
        case 'Comment':
            icon = <MessageSquare className="h-5 w-5 text-green-500" />; 
            message = 'commented on your post.';
            href = `/post/${notification.postId}`;
            break;
        default:
            return null; 
    }

    return (
        <Link href={href} className={`flex items-start gap-3 p-3 hover:bg-muted ${!notification.isRead && 'bg-primary/10'}`}>
            <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={notification.sender.avatarUrl || ''} />
                <AvatarFallback>{notification.sender.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p>
                    <span className="font-bold">{notification.sender.username}</span>
                    <span className="text-muted-foreground"> {message}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
        </Link>
    );
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
    if (notifications.length === 0) {
        return <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
            </div>
            <div className="p-2 border-t text-center">
                <Button variant="link" asChild>
                    <Link href="/notifications">View all notifications</Link>
                </Button>
            </div>
        </div>
    );
}