import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { primary, neutral } from '@/constants/colors';
import { typography, spacingScale, borderRadius } from '@/constants/responsive';
import { scale } from '@/utils/responsive';

interface CheckboxWithLabelProps {
  checked: boolean;
  onPress: () => void;
  label: string | React.ReactNode;
  containerStyle?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

const CheckboxWithLabel: React.FC<CheckboxWithLabelProps> = ({
  checked,
  onPress,
  label,
  containerStyle,
  checkboxStyle,
  labelStyle,
}) => {
  return (
    <Pressable style={[styles.container, containerStyle]} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked, checkboxStyle]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {typeof label === 'string' ? (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      ) : (
        label
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: neutral.neutral4,
    marginRight: spacingScale.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: neutral.neutral6,
  },
  checkboxChecked: {
    backgroundColor: primary.primary1,
    borderColor: primary.primary1,
  },
  checkmark: {
    color: neutral.neutral6,
    fontSize: typography.subtitle,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '900',
    color: neutral.neutral1,
    lineHeight: 16,
  },
});

export default CheckboxWithLabel;
