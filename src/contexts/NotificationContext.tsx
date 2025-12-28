import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { notificationService, type NotificationData } from '@/services/notificationService';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  deleteNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  toastVisible: boolean;
  currentToast: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  hideToast: () => void;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState<{ title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to format relative time
  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const sentDate = new Date(dateString);
    const diffMs = now.getTime() - sentDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return sentDate.toLocaleDateString();
  };

  // Helper function to determine notification type from content
  const getNotificationType = (title: string, content: string): 'info' | 'success' | 'warning' | 'error' => {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerTitle.includes('success') || lowerContent.includes('success') || lowerTitle.includes('sent')) {
      return 'success';
    }
    if (lowerTitle.includes('failed') || lowerContent.includes('failed') || lowerTitle.includes('error')) {
      return 'error';
    }
    if (lowerTitle.includes('warning') || lowerTitle.includes('reminder')) {
      return 'warning';
    }
    return 'info';
  };

  // Transform API notification to app notification
  const transformNotification = (apiNotification: NotificationData): Notification & { sentAt: string } => {
    return {
      id: apiNotification.notificationId,
      title: apiNotification.title,
      message: apiNotification.content,
      time: getRelativeTime(apiNotification.sentAt),
      isRead: apiNotification.read,
      type: getNotificationType(apiNotification.title, apiNotification.content),
      sentAt: apiNotification.sentAt, // Keep original sentAt for sorting
    };
  };

  // Fetch notifications from API
  const refreshNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications();

      if (response.code === 1000 && response.data) {
        // Transform and sort by sentAt (newest first)
        const transformedNotifications = response.data
          .map(transformNotification)
          .sort((a, b) => {
            const dateA = new Date(a.sentAt).getTime();
            const dateB = new Date(b.sentAt).getTime();
            return dateB - dateA; // Sort descending (newest first)
          })
          .map(({ sentAt, ...notification }) => notification); // Remove sentAt from final object

        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    refreshNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const deleteNotification = async (id: string) => {
    try {
      // Optimistically update UI
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));

      // Call API
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Refresh to restore state if API call fails
      refreshNotifications();
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );

      // Call API
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Refresh to restore state if API call fails
      refreshNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      // Call API
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Refresh to restore state if API call fails
      refreshNotifications();
    }
  };

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setCurrentToast({ title, message, type });
    setToastVisible(true);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        deleteNotification,
        markAsRead,
        markAllAsRead,
        showToast,
        toastVisible,
        currentToast,
        hideToast,
        refreshNotifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
