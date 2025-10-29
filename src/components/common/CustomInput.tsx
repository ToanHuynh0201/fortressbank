import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { neutral } from '@/constants/colors';

interface CustomInputProps extends TextInputProps {
  isActive?: boolean;
  containerStyle?: ViewStyle;
}

const CustomInput: React.FC<CustomInputProps> = ({
  isActive = false,
  containerStyle,
  style,
  placeholderTextColor = neutral.neutral4,
  ...textInputProps
}) => {
  return (
    <TextInput
      style={[
        styles.input,
        isActive && styles.inputActive,
        containerStyle,
        style,
      ]}
      placeholderTextColor={placeholderTextColor}
      {...textInputProps}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: neutral.neutral4,
    borderRadius: 15,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    backgroundColor: neutral.neutral6,
  },
  inputActive: {
    borderColor: neutral.neutral1,
    borderWidth: 1,
  },
});

export default CustomInput;
