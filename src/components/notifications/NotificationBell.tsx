
"use client";

import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "./NotificationList";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import type { Notification } from "@/types"; // Import your central Notification type

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notifications?limit=10');
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Real-time updates would go here (e.g., via WebSockets or Supabase Realtime)
  }, []);

  const handleOpenChange = async (open: boolean) => {
    // When the menu is opened and there are unread notifications
    if (open && unreadCount > 0) {
      // Optimistically update the UI
      setUnreadCount(0);

      // Send request to the backend to mark all as read
      try {
        await fetch('/api/notifications', { method: 'PATCH' });
        // Optionally refetch or update notification `isRead` state locally
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
        // In a real app, you might revert the optimistic update here
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center gap-3 rounded-lg px-3 py-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className=" w-full justify-start md:gap-3  text-sm relative "
        >
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="start">
        <NotificationList notifications={notifications} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}