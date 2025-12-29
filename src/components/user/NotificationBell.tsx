import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Bell } from 'phosphor-react-native';
import { neutral, semantic } from '@/constants/colors';
import { scale, fontSize, spacing } from '@/utils/responsive';
import { typography, borderRadius } from '@/constants/responsive';

interface NotificationBellProps {
  count?: number;
  onPress?: () => void;
  size?: number;
  color?: string;
  containerStyle?: ViewStyle;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  onPress,
  size = 24,
  color = neutral.neutral6,
  containerStyle,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.bellContainer}>
        <Bell size={size} color={color} weight="bold" />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: scale(48),
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
  },
  bellContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: scale(-8),
    right: scale(-8),
    minWidth: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing(5),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: semantic.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: fontSize(11),
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: neutral.neutral6,
    lineHeight: scale(16),
  },
});

export default NotificationBell;
