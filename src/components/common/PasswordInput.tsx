import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { neutral } from '@/constants/colors';

interface PasswordInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  isActive?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  containerStyle,
  isActive = false,
  style,
  placeholderTextColor = neutral.neutral4,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[
          styles.input,
          isActive && styles.inputActive,
          style,
        ]}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={!showPassword}
        {...textInputProps}
      />
      <Pressable
        style={styles.eyeIcon}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: neutral.neutral4,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingRight: 40,
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    backgroundColor: neutral.neutral6,
  },
  inputActive: {
    borderColor: neutral.neutral1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  eyeIconText: {
    fontSize: 16,
  },
});

export default PasswordInput;
