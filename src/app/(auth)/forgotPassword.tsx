import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { neutral, primary } from '@/constants';
import {
  AppHeader,
  CustomInput,
  PasswordInput,
  PrimaryButton,
  CardContainer,
  ScreenContainer,
} from '@/components';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

type Step = 'enter-phone' | 'confirm-phone' | 'enter-code' | 'change-password';

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('enter-phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    // TODO: Call API to send verification code
    console.log('Sending code to:', phoneNumber);
    setStep('confirm-phone');
  };

  const handleVerifyPhone = () => {
    // TODO: Call API to verify phone and send code
    console.log('Verifying phone:', phoneNumber);
    setStep('enter-code');
  };

  const handleResendCode = () => {
    // TODO: Call API to resend code
    console.log('Resending code to:', phoneNumber);
    Alert.alert('Success', 'Code has been resent to your phone');
  };

  const handleVerifyCode = () => {
    if (code.length < 4) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    // TODO: Call API to verify code
    console.log('Verifying code:', code);
    setStep('change-password');
  };

  const handleChangePassword = () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please enter both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // TODO: Call API to change password
    console.log('Changing password with code:', code);
    Alert.alert('Success', 'Your password has been changed successfully', [
      { text: 'OK', onPress: () => router.replace('/signIn') },
    ]);
  };

  const handleChangePhoneNumber = () => {
    setStep('enter-phone');
    setPhoneNumber('');
    setCode('');
  };

  const renderStep = () => {
    switch (step) {
      case 'enter-phone':
        return (
          <>
            <CardContainer>
              <Text style={styles.label}>Type your phone number</Text>
              <CustomInput
                placeholder="(+84)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                containerStyle={styles.inputWrapper}
              />
              <Text style={styles.infoText}>
                We texted you a code to verify your phone number
              </Text>
              <PrimaryButton
                title="Send"
                onPress={handleSendCode}
                disabled={!phoneNumber.trim()}
              />
            </CardContainer>
          </>
        );

      case 'confirm-phone':
        return (
          <>
            <CardContainer>
              <Text style={styles.label}>Type your phone number</Text>
              <CustomInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                isActive={true}
                containerStyle={styles.inputWrapper}
              />
              <Text style={styles.infoText}>
                We texted you a code to verify your phone number
              </Text>
              <PrimaryButton
                title="Send"
                onPress={handleVerifyPhone}
              />
            </CardContainer>
          </>
        );

      case 'enter-code':
        return (
          <>
            <CardContainer>
              <Text style={styles.label}>Type a code</Text>
              <View style={styles.codeInputRow}>
                <CustomInput
                  placeholder="Code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={4}
                  containerStyle={styles.codeInput}
                />
                <Pressable
                  style={styles.resendButton}
                  onPress={handleResendCode}
                >
                  <Text style={styles.resendButtonText}>Resend</Text>
                </Pressable>
              </View>
              <Text style={styles.infoText}>
                We texted you a code to verify your phone number (+84){' '}
                {phoneNumber}
              </Text>
              <Text style={styles.infoText}>
                This code will expired 10 minutes after this message. If you
                don't get a message.
              </Text>
              <PrimaryButton
                title="Change password"
                onPress={handleVerifyCode}
                disabled={code.length < 4}
              />
            </CardContainer>
            <Pressable
              style={styles.linkButton}
              onPress={handleChangePhoneNumber}
            >
              <Text style={styles.linkText}>Change your phone number</Text>
            </Pressable>
          </>
        );

      case 'change-password':
        return (
          <>
            <CardContainer>
              <Text style={styles.label}>Type a code</Text>
              <View style={styles.codeInputRow}>
                <CustomInput
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={4}
                  isActive={true}
                  containerStyle={styles.codeInput}
                />
                <Pressable
                  style={styles.resendButton}
                  onPress={handleResendCode}
                >
                  <Text style={styles.resendButtonText}>Resend</Text>
                </Pressable>
              </View>
              <Text style={styles.infoText}>
                We texted you a code to verify your phone number (+84){' '}
                {phoneNumber}
              </Text>
              <Text style={styles.infoText}>
                This code will expired 10 minutes after this message. If you
                don't get a message.
              </Text>

              {/* New Password Fields */}
              <View style={styles.passwordSection}>
                <Text style={styles.label}>New Password</Text>
                <PasswordInput
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  containerStyle={styles.passwordFieldSpacing}
                />

                <Text style={styles.label}>Confirm Password</Text>
                <PasswordInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <PrimaryButton
                title="Change password"
                onPress={handleChangePassword}
                disabled={!newPassword.trim() || !confirmPassword.trim()}
              />
            </CardContainer>
            <Pressable
              style={styles.linkButton}
              onPress={handleChangePhoneNumber}
            >
              <Text style={styles.linkText}>Change your phone number</Text>
            </Pressable>
          </>
        );
    }
  };

  return (
    <ScreenContainer backgroundColor={neutral.neutral6}>
      <StatusBar style="dark" />

      <AppHeader
        title="Forgot password"
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
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default ForgotPassword;

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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#979797',
    marginBottom: 8,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  codeInput: {
    flex: 1,
  },
  resendButton: {
    width: 100,
    height: 44,
    backgroundColor: primary.primary1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    color: neutral.neutral2,
    marginBottom: 16,
  },
  passwordSection: {
    marginTop: 8,
  },
  passwordFieldSpacing: {
    marginBottom: 16,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: primary.primary1,
  },
});
