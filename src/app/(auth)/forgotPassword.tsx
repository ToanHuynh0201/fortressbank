import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { neutral, primary } from '@/constants';

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
            <View style={styles.card}>
              <Text style={styles.label}>Type your phone number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="(+84)"
                  placeholderTextColor={neutral.neutral4}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={styles.infoText}>
                We texted you a code to verify your phone number
              </Text>
              <Pressable
                style={[
                  styles.button,
                  !phoneNumber.trim() && styles.buttonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={!phoneNumber.trim()}
              >
                <Text
                  style={[
                    styles.buttonText,
                    !phoneNumber.trim() && styles.buttonTextDisabled,
                  ]}
                >
                  Send
                </Text>
              </Pressable>
            </View>
          </>
        );

      case 'confirm-phone':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>Type your phone number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputActive]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={styles.infoText}>
                We texted you a code to verify your phone number
              </Text>
              <Pressable style={styles.button} onPress={handleVerifyPhone}>
                <Text style={styles.buttonText}>Send</Text>
              </Pressable>
            </View>
          </>
        );

      case 'enter-code':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>Type a code</Text>
              <View style={styles.codeInputRow}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="Code"
                  placeholderTextColor={neutral.neutral4}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={4}
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
              <Pressable
                style={[
                  styles.button,
                  code.length < 4 && styles.buttonDisabled,
                ]}
                onPress={handleVerifyCode}
                disabled={code.length < 4}
              >
                <Text
                  style={[
                    styles.buttonText,
                    code.length < 4 && styles.buttonTextDisabled,
                  ]}
                >
                  Change password
                </Text>
              </Pressable>
            </View>
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
            <View style={styles.card}>
              <Text style={styles.label}>Type a code</Text>
              <View style={styles.codeInputRow}>
                <TextInput
                  style={[styles.input, styles.codeInput, styles.inputActive]}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={4}
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
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter new password"
                    placeholderTextColor={neutral.neutral4}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Text style={styles.eyeIconText}>
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirm new password"
                    placeholderTextColor={neutral.neutral4}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <Text style={styles.eyeIconText}>
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[
                  styles.button,
                  (!newPassword.trim() || !confirmPassword.trim()) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={!newPassword.trim() || !confirmPassword.trim()}
              >
                <Text
                  style={[
                    styles.buttonText,
                    (!newPassword.trim() || !confirmPassword.trim()) &&
                      styles.buttonTextDisabled,
                  ]}
                >
                  Change password
                </Text>
              </Pressable>
            </View>
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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Forgot password</Text>
      </View>

      {/* Main Content */}
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
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neutral.neutral6,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 25,
    backgroundColor: neutral.neutral6,
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: neutral.neutral1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: neutral.neutral1,
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
  card: {
    backgroundColor: neutral.neutral6,
    borderRadius: 15,
    padding: 16,
    shadowColor: '#3629B7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 5,
    marginBottom: 24,
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
  input: {
    height: 44,
    borderWidth: 0.5,
    borderColor: '#E8E8E8',
    borderRadius: 15,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    backgroundColor: '#FAFAFC',
  },
  inputActive: {
    borderColor: '#CBCBCB',
    borderWidth: 1,
    backgroundColor: neutral.neutral6,
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
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 40,
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  eyeIconText: {
    fontSize: 16,
  },
  button: {
    height: 44,
    backgroundColor: primary.primary1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: primary.primary4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: neutral.neutral6,
  },
  buttonTextDisabled: {
    color: neutral.neutral6,
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
