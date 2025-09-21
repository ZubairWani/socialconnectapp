"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Use Supabase browser client

// Define the shape of a Notification
interface Notification {
  id: string;
  isRead: boolean;
  // ... other notification fields (sender, type, post, etc.)
  sender: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

/**
 * Custom hook to manage real-time notifications using Supabase.
 * Fetches initial data and subscribes to changes in the 'Notification' table.
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Fetch initial notifications
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error('Failed to fetch notifications.');
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialNotifications();
  }, []);

  // Set up Supabase real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Notification' },
        (payload) => {
          console.log('New notification received!', payload.new);
          // Add the new notification to the top of the list
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    // Cleanup function to remove the channel subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async (notificationId: string) => {
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    // API call
    await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    // API call
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}