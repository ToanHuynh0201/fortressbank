import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { primary, neutral } from '@/constants/colors';

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
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: neutral.neutral4,
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: neutral.neutral1,
    lineHeight: 16,
  },
});

export default CheckboxWithLabel;
