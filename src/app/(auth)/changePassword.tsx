import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { primary, neutral } from '@/constants/colors';
import {
  AppHeader,
  PasswordInput,
  PrimaryButton,
  CardContainer,
  ScreenContainer,
  DecorativeIllustration,
} from '@/components';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const ChangePassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<'enter-passwords' | 'success'>('enter-passwords');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from old password');
      return;
    }

    // TODO: Call API to change password
    console.log('Changing password...');
    setStep('success');
  };

  const handleOk = () => {
    router.replace('/signIn');
  };

  if (step === 'success') {
    return (
      <ScreenContainer backgroundColor={neutral.neutral6}>
        <StatusBar style="dark" />

        <AppHeader
          title="Change password"
          showBackButton={false}
          backgroundColor={neutral.neutral6}
          textColor={neutral.neutral1}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.successContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Illustration */}
          <DecorativeIllustration size={150} circleColor={primary.primary4}>
            <Text style={styles.successIcon}>✓</Text>
          </DecorativeIllustration>

          <Text style={styles.successTitle}>Change password successfully!</Text>
          <Text style={styles.successMessage}>
            You have successfully change password.{'\n'}
            Please use the new password when Sign in.
          </Text>

          <PrimaryButton
            title="Ok"
            onPress={handleOk}
            style={styles.okButton}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer backgroundColor={neutral.neutral6}>
      <StatusBar style="dark" />

      <AppHeader
        title="Change password"
        backgroundColor={neutral.neutral6}
        textColor={neutral.neutral1}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <CardContainer>
            {/* Old Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Type your old password</Text>
              <PasswordInput
                placeholder="************"
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>

            {/* New Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Type your new password</Text>
              <PasswordInput
                placeholder="************"
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm password</Text>
              <PasswordInput
                placeholder="************"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Change Password Button */}
            <PrimaryButton
              title="Change password"
              onPress={handleChangePassword}
              disabled={!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              style={styles.button}
            />
          </CardContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: neutral.neutral6,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#979797',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  // Success Screen Styles
  successContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    fontWeight: 'bold',
    color: primary.primary1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: primary.primary1,
    marginBottom: 24,
    marginTop: 32,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: 32,
  },
  okButton: {
    width: 327,
  },
});
