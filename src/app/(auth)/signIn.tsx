import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { primary, neutral } from "@/constants/colors";
import {
  AuthLayout,
  CustomInput,
  PasswordInput,
  PrimaryButton,
  LinkText,
  DecorativeIllustration,
} from '@/components';

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // TODO: Implement sign in logic
    // console.log('Sign in with:', email, password);
    router.replace('/(home)');
  };

  return (
    <AuthLayout title="Sign in">
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Hello there, sign in to continue</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <DecorativeIllustration />
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.input}
        />

        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.input}
        />

        <Pressable onPress={() => router.push('/(auth)/forgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot your password ?</Text>
        </Pressable>
      </View>

      {/* Sign In Button */}
      <PrimaryButton
        title="Sign in"
        onPress={handleSignIn}
        disabled={!email || !password}
        style={styles.signInButton}
      />

      {/* Fingerprint */}
      <View style={styles.fingerprintContainer}>
        <View style={styles.fingerprint}>
          <Text style={styles.fingerprintIcon}>🔒</Text>
        </View>
      </View>

      {/* Sign Up Link */}
      <LinkText
        normalText="Don't have an account? "
        linkText="Sign Up"
        onPress={() => router.navigate('(auth)/signUp')}
        
      />
    </AuthLayout>
  );
};

export default SignIn;

const styles = StyleSheet.create({
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
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: '500',
    color: neutral.neutral4,
    textAlign: 'right',
  },
  signInButton: {
    marginBottom: 24,
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
});
