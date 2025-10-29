import React, { ReactNode } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { primary, neutral } from '@/constants/colors';
import AppHeader from '../common/AppHeader';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  headerBackgroundColor?: string;
  contentBackgroundColor?: string;
  containerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  showBackButton = true,
  onBack,
  headerBackgroundColor = primary.primary1,
  contentBackgroundColor = neutral.neutral6,
  containerStyle,
  contentContainerStyle,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: headerBackgroundColor }, containerStyle]}>
      <StatusBar style="light" />
      
      <AppHeader
        title={title}
        showBackButton={showBackButton}
        onBack={onBack}
        backgroundColor={headerBackgroundColor}
        textColor={neutral.neutral6}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackgroundColor }]}
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
});

export default AuthLayout;
