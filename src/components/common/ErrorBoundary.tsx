import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { scale, fontSize, spacing } from '@/utils/responsive';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch React component errors
 * Prevents the entire app from crashing and shows a user-friendly error screen
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error tracking service (Sentry, Bugsnag, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.handleReset();
    router.replace('/(tabs)/home');
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleReset}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleGoHome}
              >
                <Text style={styles.secondaryButtonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(20),
  },
  content: {
    alignItems: 'center',
    maxWidth: scale(400),
  },
  emoji: {
    fontSize: fontSize(64),
    marginBottom: spacing(20),
  },
  title: {
    fontSize: fontSize(24),
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: spacing(12),
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing(24),
    lineHeight: fontSize(24),
  },
  errorDetails: {
    backgroundColor: '#f5f5f5',
    padding: spacing(16),
    borderRadius: scale(8),
    marginBottom: spacing(24),
    width: '100%',
  },
  errorTitle: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: spacing(8),
  },
  errorText: {
    fontSize: fontSize(12),
    color: '#d32f2f',
    marginBottom: spacing(8),
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: fontSize(10),
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing(12),
  },
  button: {
    paddingVertical: spacing(14),
    paddingHorizontal: spacing(24),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: fontSize(16),
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: scale(1),
    borderColor: '#1976d2',
  },
  secondaryButtonText: {
    color: '#1976d2',
    fontSize: fontSize(16),
    fontWeight: '600',
  },
});
