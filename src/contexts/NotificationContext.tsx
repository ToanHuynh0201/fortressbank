import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Notification {
  id: number;
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
  deleteNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  toastVisible: boolean;
  currentToast: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  hideToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState<{ title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Transfer Successful',
      message: 'You have successfully transferred $500.00 to John Doe.',
      time: '2 min ago',
      isRead: false,
      type: 'success',
    },
    {
      id: 2,
      title: 'Payment Reminder',
      message: 'Your credit card payment of $1,250.00 is due in 3 days.',
      time: '1 hour ago',
      isRead: false,
      type: 'warning',
    },
    {
      id: 3,
      title: 'Account Update',
      message: 'Your account information has been updated successfully.',
      time: '3 hours ago',
      isRead: true,
      type: 'info',
    },
    {
      id: 4,
      title: 'New Login Detected',
      message: 'A new login was detected from Windows device.',
      time: '5 hours ago',
      isRead: true,
      type: 'info',
    },
    {
      id: 5,
      title: 'Deposit Received',
      message: 'You have received a deposit of $2,345.00 from ABC Corp.',
      time: 'Yesterday',
      isRead: false,
      type: 'success',
    },
    {
      id: 6,
      title: 'Security Alert',
      message: 'Failed login attempt detected. Please verify your account.',
      time: '2 days ago',
      isRead: true,
      type: 'error',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
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
