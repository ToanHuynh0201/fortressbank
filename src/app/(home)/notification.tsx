import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common';
import { primary, neutral, semantic } from '@/constants/colors';

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  isRead?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  message,
  time,
  isRead = false,
  type = 'info',
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return semantic.success;
      case 'warning':
        return semantic.warning;
      case 'error':
        return semantic.error;
      default:
        return semantic.info;
    }
  };

  return (
    <View style={[styles.notificationItem, !isRead && styles.unreadItem]}>
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.notificationTime}>{time}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </View>
  );
};

const Notification = () => {
  const notifications = [
    {
      id: 1,
      title: 'Transfer Successful',
      message: 'You have successfully transferred $500.00 to John Doe.',
      time: '2 min ago',
      isRead: false,
      type: 'success' as const,
    },
    {
      id: 2,
      title: 'Payment Reminder',
      message: 'Your credit card payment of $1,250.00 is due in 3 days.',
      time: '1 hour ago',
      isRead: false,
      type: 'warning' as const,
    },
    {
      id: 3,
      title: 'Account Update',
      message: 'Your account information has been updated successfully.',
      time: '3 hours ago',
      isRead: true,
      type: 'info' as const,
    },
    {
      id: 4,
      title: 'New Login Detected',
      message: 'A new login was detected from Windows device.',
      time: '5 hours ago',
      isRead: true,
      type: 'info' as const,
    },
    {
      id: 5,
      title: 'Deposit Received',
      message: 'You have received a deposit of $2,345.00 from ABC Corp.',
      time: 'Yesterday',
      isRead: true,
      type: 'success' as const,
    },
    {
      id: 6,
      title: 'Security Alert',
      message: 'Failed login attempt detected. Please verify your account.',
      time: '2 days ago',
      isRead: true,
      type: 'error' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title="Notifications" 
        showBackButton={true}
        backgroundColor={primary.primary1}
        textColor={neutral.neutral6}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              time={notification.time}
              isRead={notification.isRead}
              type={notification.type}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary.primary1,
  },
  content: {
    flex: 1,
    backgroundColor: neutral.neutral6,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  notificationsList: {
    gap: 0,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: neutral.neutral6,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  unreadItem: {
    backgroundColor: '#F8F9FF',
  },
  typeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: neutral.neutral1,
    marginRight: 8,
  },
  notificationTime: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: neutral.neutral3,
  },
  notificationMessage: {
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    color: neutral.neutral2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: semantic.info,
    marginLeft: 8,
    marginTop: 8,
  },
});