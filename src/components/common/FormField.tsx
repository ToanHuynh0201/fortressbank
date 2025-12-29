import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { neutral } from '@/constants/colors';
import CustomInput from './CustomInput';
import PasswordInput from './PasswordInput';
import { scale, fontSize, spacing } from '@/utils/responsive';
import { typography, spacingScale, borderRadius, componentSizes } from '@/constants/responsive';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
  isActive?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputContainerStyle?: ViewStyle;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  error?: string;
}

/**
 * Reusable form field component with label
 * Supports both regular and password inputs
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  isActive,
  containerStyle,
  labelStyle,
  inputContainerStyle,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  error,
}) => {
  const InputComponent = isPassword ? PasswordInput : CustomInput;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <InputComponent
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        isActive={isActive}
        containerStyle={inputContainerStyle}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacingScale.lg,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#979797',
    marginBottom: spacingScale.sm,
  },
  errorText: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: '#FF3B30',
    marginTop: spacing(4),
  },
});

export default FormField;
