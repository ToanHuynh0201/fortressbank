import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { neutral, primary } from '@/constants/colors';
import { scale, fontSize, spacing } from '@/utils/responsive';

interface SettingRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  showChevron = true,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        {showChevron && (
          <CaretRight size={scale(20)} color={neutral.neutral3} weight="bold" />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing(24),
    marginBottom: spacing(12),
    backgroundColor: neutral.neutral6,
    borderRadius: scale(16),
    paddingVertical: spacing(16),
    paddingHorizontal: spacing(16),
    shadowColor: primary.primary1,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.06,
    shadowRadius: scale(8),
    elevation: 2,
    borderWidth: 1,
    borderColor: neutral.neutral5,
  },
  containerPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: fontSize(15),
    fontWeight: '600',
    lineHeight: 20,
    color: neutral.neutral1,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: fontSize(13),
    fontWeight: '500',
    lineHeight: 18,
    color: neutral.neutral3,
    marginTop: spacing(2),
  },
});

export default SettingRow;
