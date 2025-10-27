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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { primary, neutral, semantic } from '@/constants/colors';

const SignUp = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = () => {
    // TODO: Implement sign up logic
    console.log('Sign up with:', name, phone, password);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with purple background */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Sign up</Text>
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Welcome to us,</Text>
            <Text style={styles.subtitle}>Hello there, create New account</Text>
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <View style={[styles.illustrationCircle, { backgroundColor: primary.primary4 }]} />
              <View style={[styles.illustrationDot, styles.dot1, { backgroundColor: semantic.info }]} />
              <View style={[styles.illustrationDot, styles.dot2, { backgroundColor: semantic.error }]} />
              <View style={[styles.illustrationDot, styles.dot3, { backgroundColor: semantic.warning }]} />
              <View style={[styles.illustrationDot, styles.dot4, { backgroundColor: semantic.success }]} />
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, name && styles.inputActive]}
              placeholder="Name"
              placeholderTextColor={neutral.neutral4}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={[styles.input, phone && styles.inputActive]}
              placeholder="Phone Number"
              placeholderTextColor={neutral.neutral4}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, password && styles.inputActive]}
                placeholder="Password"
                placeholderTextColor={neutral.neutral4}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Terms and Conditions */}
          <Pressable 
            style={styles.termsContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              By creating an account your aggree{'\n'}to our{' '}
              <Text style={styles.termsLink}>Term and Condtions</Text>
            </Text>
          </Pressable>

          {/* Sign Up Button */}
          <Pressable 
            style={[
              styles.signUpButton, 
              (!name || !phone || !password || !agreedToTerms) && styles.signUpButtonDisabled
            ]}
            onPress={handleSignUp}
            disabled={!name || !phone || !password || !agreedToTerms}
          >
            <Text style={styles.signUpButtonText}>
              Sign up
            </Text>
          </Pressable>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Have an account? </Text>
            <Pressable onPress={() => router.navigate('/(auth)/signIn')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </Pressable>
          </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary.primary1,
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
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: neutral.neutral6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: neutral.neutral6,
  },
  content: {
    flex: 1,
    backgroundColor: neutral.neutral6,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: primary.primary1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: neutral.neutral1,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 213,
    height: 165,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustrationCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  illustrationDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  dot1: {
    width: 10,
    height: 10,
    top: 65,
    left: 0,
  },
  dot2: {
    width: 25,
    height: 25,
    top: 22,
    right: 0,
  },
  dot3: {
    width: 20,
    height: 20,
    bottom: 34,
    left: 42,
  },
  dot4: {
    width: 10,
    height: 10,
    bottom: 34,
    right: 35,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: neutral.neutral4,
    borderRadius: 15,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    marginBottom: 16,
    backgroundColor: neutral.neutral6,
  },
  inputActive: {
    borderColor: neutral.neutral4,
    color: neutral.neutral1,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  passwordInput: {
    marginBottom: 0,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
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
  termsText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: neutral.neutral1,
    lineHeight: 16,
  },
  termsLink: {
    color: primary.primary1,
    textDecorationLine: 'underline',
  },
  signUpButton: {
    height: 44,
    backgroundColor: primary.primary1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  signUpButtonDisabled: {
    backgroundColor: primary.primary4,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: neutral.neutral6,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 12,
    fontWeight: '400',
    color: neutral.neutral1,
  },
  signInLink: {
    fontSize: 12,
    fontWeight: '600',
    color: primary.primary1,
  },
});
