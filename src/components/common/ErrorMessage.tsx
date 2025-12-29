import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { typography, spacingScale, borderRadius } from '@/constants/responsive';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  retryButtonText?: string;
  showDismissButton?: boolean;
}

/**
 * Inline error message component with retry/dismiss options
 * Use this for form errors or inline notifications
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  variant = 'error',
  retryButtonText = 'Try Again',
  showDismissButton = true,
}) => {
  const variantStyles = {
    error: {
      container: styles.errorContainer,
      icon: 'error-outline' as keyof typeof MaterialIcons.glyphMap,
      iconColor: '#DC2626',
      text: styles.errorText,
    },
    warning: {
      container: styles.warningContainer,
      icon: 'warning' as keyof typeof MaterialIcons.glyphMap,
      iconColor: '#F59E0B',
      text: styles.warningText,
    },
    info: {
      container: styles.infoContainer,
      icon: 'info-outline' as keyof typeof MaterialIcons.glyphMap,
      iconColor: '#3B82F6',
      text: styles.infoText,
    },
  };

  const style = variantStyles[variant];

  return (
    <View style={[styles.container, style.container]}>
      <View style={styles.contentRow}>
        <MaterialIcons name={style.icon} size={20} color={style.iconColor} style={styles.icon} />
        <Text style={[styles.message, style.text]}>{message}</Text>
      </View>

      {(onRetry || (onDismiss && showDismissButton)) && (
        <View style={styles.actionsRow}>
          {onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <MaterialIcons name="refresh" size={16} color={style.iconColor} />
              <Text style={[styles.retryButtonText, { color: style.iconColor }]}>
                {retryButtonText}
              </Text>
            </TouchableOpacity>
          )}

          {onDismiss && showDismissButton && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacingScale.md,
    marginVertical: spacingScale.sm,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoContainer: {
    backgroundColor: '#DBEAFE',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacingScale.sm,
  },
  icon: {
    marginRight: spacingScale.sm,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    fontFamily: 'Poppins',
  },
  errorText: {
    color: '#DC2626',
  },
  warningText: {
    color: '#D97706',
  },
  infoText: {
    color: '#2563EB',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacingScale.md,
    marginTop: spacingScale.xs,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingScale.xs + 2,
    paddingHorizontal: spacingScale.md,
    gap: spacingScale.xs,
  },
  retryButtonText: {
    fontSize: typography.caption,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  dismissButton: {
    padding: spacingScale.xs,
  },
});
