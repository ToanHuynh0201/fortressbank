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
import { primary, neutral, semantic } from '@/constants/colors';

const ChangePassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<'enter-passwords' | 'success'>('enter-passwords');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButtonPlaceholder} />
          <Text style={styles.headerTitle}>Change password</Text>
        </View>

        {/* Success Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.successContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Illustration */}
          <View style={styles.successIllustration}>
            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <View style={[styles.successDot, styles.successDot1, { backgroundColor: semantic.success }]} />
            <View style={[styles.successDot, styles.successDot2, { backgroundColor: semantic.warning }]} />
            <View style={[styles.successDot, styles.successDot3, { backgroundColor: semantic.error }]} />
            <View style={[styles.successDot, styles.successDot4, { backgroundColor: semantic.info }]} />
          </View>

          <Text style={styles.successTitle}>Change password successfully!</Text>
          <Text style={styles.successMessage}>
            You have successfully change password.{'\n'}
            Please use the new password when Sign in.
          </Text>

          <Pressable style={styles.okButton} onPress={handleOk}>
            <Text style={styles.okButtonText}>Ok</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Change password</Text>
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
          <View style={styles.card}>
            {/* Old Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Type your old password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="************"
                  placeholderTextColor={neutral.neutral4}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showOldPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Type your new password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="************"
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
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="************"
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

            {/* Change Password Button */}
            <Pressable
              style={[
                styles.button,
                (!oldPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={
                !oldPassword.trim() ||
                !newPassword.trim() ||
                !confirmPassword.trim()
              }
            >
              <Text
                style={[
                  styles.buttonText,
                  (!oldPassword.trim() ||
                    !newPassword.trim() ||
                    !confirmPassword.trim()) &&
                    styles.buttonTextDisabled,
                ]}
              >
                Change password
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChangePassword;

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
  backButtonPlaceholder: {
    width: 40,
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
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBCBCB',
    borderRadius: 15,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    backgroundColor: neutral.neutral6,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 40,
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
    marginTop: 8,
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
  // Success Screen Styles
  successContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successIllustration: {
    width: 327,
    height: 216,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  successCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    fontWeight: 'bold',
    color: primary.primary1,
  },
  successDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  successDot1: {
    width: 20,
    height: 20,
    top: 80,
    left: 40,
  },
  successDot2: {
    width: 30,
    height: 30,
    top: 30,
    right: 50,
  },
  successDot3: {
    width: 25,
    height: 25,
    bottom: 50,
    left: 60,
  },
  successDot4: {
    width: 15,
    height: 15,
    bottom: 70,
    right: 40,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: primary.primary1,
    marginBottom: 24,
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
    height: 44,
    backgroundColor: primary.primary1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: neutral.neutral6,
  },
});
