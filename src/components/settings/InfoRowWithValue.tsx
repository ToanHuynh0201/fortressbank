import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { neutral, primary } from '@/constants/colors';
import { scale, fontSize, spacing } from '@/utils/responsive';

interface InfoRowWithValueProps {
  title: string;
  value: string;
  onPress?: () => void;
  showChevron?: boolean;
}

const InfoRowWithValue: React.FC<InfoRowWithValueProps> = ({
  title,
  value,
  onPress,
  showChevron = true,
}) => {
  const content = (
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightContent}>
        <Text style={styles.value}>{value}</Text>
        {showChevron && (
          <CaretRight size={scale(16)} color={neutral.neutral2} weight="regular" />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        style={styles.container}
        onPress={onPress}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}
      >
        {content}
        <View style={styles.divider} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {content}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing(24),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: scale(36),
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: fontSize(16),
    fontWeight: '500',
    lineHeight: 24,
    color: neutral.neutral1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(8),
  },
  value: {
    fontFamily: 'Poppins',
    fontSize: fontSize(16),
    fontWeight: '600',
    lineHeight: 24,
    color: primary.primary1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginTop: spacing(12),
  },
});

export default InfoRowWithValue;
