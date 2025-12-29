import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { neutral, semantic } from '@/constants/colors';
import { scale, fontSize, spacing } from '@/utils/responsive';

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  isRead?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  onDelete?: () => void;
  onPress?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  message,
  time,
  isRead = false,
  type = 'info',
  onDelete,
  onPress,
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

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={onDelete}
      activeOpacity={0.7}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <TouchableOpacity 
        style={[styles.notificationItem, !isRead && styles.unreadItem]}
        onPress={onPress}
        activeOpacity={0.7}
      >
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
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing(24),
    paddingVertical: spacing(16),
    backgroundColor: neutral.neutral6,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  unreadItem: {
    backgroundColor: '#F8F9FF',
  },
  typeIndicator: {
    width: scale(4),
    borderRadius: scale(2),
    marginRight: spacing(12),
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(6),
  },
  notificationTitle: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: fontSize(15),
    fontWeight: '600',
    lineHeight: scale(22),
    color: neutral.neutral1,
    marginRight: spacing(8),
  },
  notificationTime: {
    fontFamily: 'Poppins',
    fontSize: fontSize(12),
    fontWeight: '400',
    lineHeight: scale(16),
    color: neutral.neutral3,
  },
  notificationMessage: {
    fontFamily: 'Poppins',
    fontSize: fontSize(13),
    fontWeight: '400',
    lineHeight: scale(20),
    color: neutral.neutral2,
  },
  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: semantic.info,
    marginLeft: spacing(8),
    marginTop: spacing(8),
  },
  deleteButton: {
    backgroundColor: semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(80),
    marginVertical: spacing(8),
    marginRight: spacing(16),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.15,
    shadowRadius: scale(3.84),
    elevation: 3,
  },
  deleteButtonText: {
    color: neutral.neutral6,
    fontFamily: 'Poppins',
    fontSize: fontSize(14),
    fontWeight: '600',
  },
});

export default NotificationItem;
