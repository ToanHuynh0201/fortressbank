import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { typography, spacingScale, borderRadius } from '@/constants/responsive';
import { scale } from '@/utils/responsive';

export type ErrorType = 'network' | 'server' | 'notFound' | 'generic' | 'timeout' | 'unauthorized';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  retryButtonText?: string;
  showRetryButton?: boolean;
  showGoBackButton?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  illustration?: any;
}

const errorConfig: Record<ErrorType, {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message: string;
  color: string;
}> = {
  network: {
    icon: 'wifi-off',
    title: 'No Internet Connection',
    message: 'Please check your internet connection and try again.',
    color: '#FF9800',
  },
  server: {
    icon: 'cloud-off',
    title: 'Server Error',
    message: 'We are experiencing technical difficulties. Please try again later.',
    color: '#F44336',
  },
  notFound: {
    icon: 'search-off',
    title: 'Not Found',
    message: 'The content you are looking for could not be found.',
    color: '#9E9E9E',
  },
  timeout: {
    icon: 'schedule',
    title: 'Request Timeout',
    message: 'The request took too long. Please try again.',
    color: '#FF9800',
  },
  unauthorized: {
    icon: 'lock',
    title: 'Unauthorized',
    message: 'You do not have permission to access this resource.',
    color: '#F44336',
  },
  generic: {
    icon: 'error-outline',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    color: '#F44336',
  },
};

/**
 * ErrorState component for displaying user-friendly error screens
 * Shows appropriate icon, message, and recovery options
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  onGoBack,
  retryButtonText = 'Try Again',
  showRetryButton = true,
  showGoBackButton = false,
  icon,
  illustration,
}) => {
  const config = errorConfig[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayIcon = icon || config.icon;
  const iconColor = config.color;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {illustration ? (
          <Image source={illustration} style={styles.illustration} />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <MaterialIcons name={displayIcon} size={64} color={iconColor} />
          </View>
        )}

        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.message}>{displayMessage}</Text>

        <View style={styles.buttonContainer}>
          {showRetryButton && onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: iconColor }]}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <MaterialIcons name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>{retryButtonText}</Text>
            </TouchableOpacity>
          )}

          {showGoBackButton && onGoBack && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onGoBack}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={20} color="#666" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingScale.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: scale(360),
    width: '100%',
  },
  iconContainer: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacingScale.xl,
  },
  illustration: {
    width: scale(200),
    height: scale(200),
    marginBottom: spacingScale.xl,
    resizeMode: 'contain',
  },
  title: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: spacingScale.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacingScale.xxl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacingScale.md,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.xl,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonIcon: {
    marginRight: spacingScale.sm,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
});
