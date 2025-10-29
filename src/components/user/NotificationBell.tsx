import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Bell } from 'phosphor-react-native';
import { neutral, semantic } from '@/constants/colors';

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
    <TouchableOpacity style={[styles.container, containerStyle]} onPress={onPress}>
      <Bell size={size} color={color} weight="regular" />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 26,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -6,
    minWidth: 16,
    height: 18,
    borderRadius: 8,
    backgroundColor: semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: neutral.neutral6,
    lineHeight: 17,
  },
});

export default NotificationBell;
