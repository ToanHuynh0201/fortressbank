import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { neutral } from '@/constants/colors';

interface SettingRowProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  subtitle,
  onPress,
  showChevron = true,
}) => {
  return (
    <Pressable 
      style={styles.container}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
        {showChevron && (
          <CaretRight size={16} color={neutral.neutral2} weight="regular" />
        )}
      </View>
      <View style={styles.divider} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: neutral.neutral1,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: '#979797',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginTop: 12,
  },
});

export default SettingRow;
