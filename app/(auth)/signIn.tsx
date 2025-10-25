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

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    // TODO: Implement sign in logic
    console.log('Sign in with:', email, password);
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
              <View style={[styles.illustrationCircle, { backgroundColor: '#E5E2FF' }]} />
              <View style={[styles.illustrationDot, styles.dot1, { backgroundColor: '#0890FE' }]} />
              <View style={[styles.illustrationDot, styles.dot2, { backgroundColor: '#FF4267' }]} />
              <View style={[styles.illustrationDot, styles.dot3, { backgroundColor: '#FFAF2A' }]} />
              <View style={[styles.illustrationDot, styles.dot4, { backgroundColor: '#52D5BA' }]} />
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#CACACA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#CACACA"
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

            <Pressable>
              <Text style={styles.forgotPassword}>Forgot your password ?</Text>
            </Pressable>
          </View>

          {/* Sign In Button */}
          <Pressable 
            style={[styles.signInButton, (!email || !password) && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={!email || !password}
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
            <Pressable onPress={() => router.push('/sign-up')}>
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
    backgroundColor: '#3629B7', // Primary purple
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
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#3629B7',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#343434',
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
    borderColor: '#CBCBCB',
    borderRadius: 15,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#343434',
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
    color: '#CACACA',
    textAlign: 'right',
  },
  signInButton: {
    height: 44,
    backgroundColor: '#3629B7',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonDisabled: {
    backgroundColor: '#F2F1F9',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  signInButtonTextDisabled: {
    color: '#FFFFFF',
  },
  fingerprintContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fingerprint: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2F1F9',
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
    color: '#343434',
  },
  signUpLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3629B7',
  },
});
