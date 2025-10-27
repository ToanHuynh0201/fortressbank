import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { primary, neutral, semantic } from "@/constants/colors";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    // TODO: Implement sign in logic
    // console.log('Sign in with:', email, password);
    router.replace('/(home)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with purple background */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Sign in</Text>
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
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Hello there, sign in to continue</Text>
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
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={neutral.neutral4}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
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

            <Pressable onPress={() => router.push('/(auth)/forgotPassword')}>
              <Text style={styles.forgotPassword}>Forgot your password ?</Text>
            </Pressable>
          </View>

          {/* Sign In Button */}
          <Pressable 
            // style={[styles.signInButton, (!email || !password) && styles.signInButtonDisabled]}
            style={styles.signInButton}
            onPress={handleSignIn}
            // disabled={!email || !password}
          >
            <Text style={[styles.signInButtonText, (!email || !password) && styles.signInButtonTextDisabled]}>
              Sign in
            </Text>
          </Pressable>

          {/* Fingerprint */}
          <View style={styles.fingerprintContainer}>
            <View style={styles.fingerprint}>
              <Text style={styles.fingerprintIcon}>🔒</Text>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Pressable onPress={() => router.navigate('/signUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignIn;

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
    marginBottom: 24,
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
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
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
  forgotPassword: {
    fontSize: 12,
    fontWeight: '500',
    color: neutral.neutral4,
    textAlign: 'right',
  },
  signInButton: {
    height: 44,
    backgroundColor: primary.primary1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonDisabled: {
    backgroundColor: primary.primary4,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: neutral.neutral6,
  },
  signInButtonTextDisabled: {
    color: neutral.neutral6,
  },
  fingerprintContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fingerprint: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerprintIcon: {
    fontSize: 32,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 12,
    fontWeight: '400',
    color: neutral.neutral1,
  },
  signUpLink: {
    fontSize: 12,
    fontWeight: '600',
    color: primary.primary1,
  },
});
