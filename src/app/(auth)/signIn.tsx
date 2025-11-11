import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { primary, neutral, commonStyles } from "@/constants";
import {
  AuthLayout,
  CustomInput,
  PasswordInput,
  PrimaryButton,
  LinkText,
  DecorativeIllustration,
} from '@/components';
import { useForm } from '@/hooks';
import { validationRules } from '@/utils';

const SignIn = () => {
  const router = useRouter();
  const { values, handleChange, isValid } = useForm({
    email: '',
    password: '',
  });

  const welcomeOpacity = useSharedValue(0);
  const welcomeTranslateY = useSharedValue(20);
  const illustrationScale = useSharedValue(0.8);
  const illustrationOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);

  useEffect(() => {
    // Welcome section
    welcomeOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    welcomeTranslateY.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });

    // Illustration
    illustrationOpacity.value = withDelay(
      150,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );
    illustrationScale.value = withDelay(
      150,
      withSpring(1, {
        damping: 18,
        stiffness: 90,
      })
    );

    // Form
    formOpacity.value = withDelay(
      250,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );
    formTranslateY.value = withDelay(
      250,
      withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
    );
  }, []);

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [{ translateY: welcomeTranslateY.value }],
  }));

  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.value,
    transform: [{ scale: illustrationScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleSignIn = () => {
    router.replace('/(home)');
  };

  return (
    <AuthLayout title="Sign in">
      <Animated.View style={[styles.welcomeSection, welcomeAnimatedStyle]}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Hello there, sign in to continue</Text>
      </Animated.View>

      {/* Illustration */}
      <Animated.View style={[styles.illustrationContainer, illustrationAnimatedStyle]}>
        <DecorativeIllustration />
      </Animated.View>

      {/* Input Fields */}
      <Animated.View style={[styles.inputContainer, formAnimatedStyle]}>
        <CustomInput
          placeholder="Email"
          value={values.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.input}
        />

        <PasswordInput
          placeholder="Password"
          value={values.password}
          onChangeText={(text) => handleChange('password', text)}
          containerStyle={styles.input}
        />

        <Pressable onPress={() => router.push('/(auth)/forgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot your password ?</Text>
        </Pressable>
      </Animated.View>

      {/* Sign In Button */}
      <Animated.View style={formAnimatedStyle}>
      <PrimaryButton
        title="Sign in"
        onPress={handleSignIn}
          disabled={!values.email || !values.password}
          style={styles.signInButton}
        />
      </Animated.View>

      {/* Fingerprint */}
      <Animated.View style={[styles.fingerprintContainer, formAnimatedStyle]}>
        <View style={styles.fingerprint}>
          <Text style={styles.fingerprintIcon}>🔒</Text>
        </View>
      </Animated.View>

      {/* Sign Up Link */}
      <Animated.View style={formAnimatedStyle}>
        <LinkText
          normalText="Don't have an account? "
          linkText="Sign Up"
          onPress={() => router.navigate('(auth)/signUp')}
          
        />
      </Animated.View>
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
