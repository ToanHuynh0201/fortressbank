import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { primary, neutral, commonStyles } from '@/constants';
import {
  AuthLayout,
  CustomInput,
  PasswordInput,
  PrimaryButton,
  LinkText,
  DecorativeIllustration,
  CheckboxWithLabel,
} from '@/components';
import { useForm } from '@/hooks';

const SignUp = () => {
  const router = useRouter();
  const { values, handleChange, setFieldValue } = useForm({
    name: '',
    phone: '',
    password: '',
    agreedToTerms: false,
  });

  const handleSignUp = () => {
    // TODO: Implement sign up logic
    console.log('Sign up with:', values);
  };

  const isFormValid = values.name && values.phone && values.password && values.agreedToTerms;

  return (
    <AuthLayout title="Sign up">
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>Welcome to us,</Text>
        <Text style={styles.subtitle}>Hello there, create New account</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <DecorativeIllustration />
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <CustomInput
          placeholder="Name"
          value={values.name}
          onChangeText={(text) => handleChange('name', text)}
          autoCapitalize="words"
          isActive={!!values.name}
          containerStyle={styles.input}
        />

        <CustomInput
          placeholder="Phone Number"
          value={values.phone}
          onChangeText={(text) => handleChange('phone', text)}
          keyboardType="phone-pad"
          autoCapitalize="none"
          isActive={!!values.phone}
          containerStyle={styles.input}
        />

        <PasswordInput
          placeholder="Password"
          value={values.password}
          onChangeText={(text) => handleChange('password', text)}
          isActive={!!values.password}
          containerStyle={styles.passwordInput}
        />
      </View>

      {/* Terms and Conditions */}
      <CheckboxWithLabel
        checked={values.agreedToTerms}
        onPress={() => setFieldValue('agreedToTerms', !values.agreedToTerms)}
        label={
          <Text style={styles.termsText}>
            By creating an account your aggree{'\n'}to our{' '}
            <Text style={styles.termsLink}>Term and Condtions</Text>
          </Text>
        }
        containerStyle={styles.termsContainer}
      />

      {/* Sign Up Button */}
      <PrimaryButton
        title="Sign up"
        onPress={handleSignUp}
        disabled={!isFormValid}
        style={styles.signUpButton}
      />

      {/* Sign In Link */}
      <LinkText
        normalText="Have an account? "
        linkText="Sign In"
        onPress={() => router.navigate('/(auth)/signIn')}
      />
    </AuthLayout>
  );
};

export default SignUp;

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
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 0,
  },
  termsContainer: {
    marginBottom: 24,
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
    marginBottom: 32,
  },
});
