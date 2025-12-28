import { useState, useCallback } from 'react';
import { handleError, getUserFriendlyMessage, getRecoverySuggestion } from '@/utils/errorHandler';
import { parseError } from '@/utils/error';
import { logger } from '@/utils/logger';
import { ErrorInfo } from '@/types/api';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logErrors?: boolean;
  onError?: (error: ErrorInfo) => void;
}

interface ErrorState {
  error: ErrorInfo | null;
  hasError: boolean;
  isRecoverable: boolean;
  recoverySuggestion: string | null;
}

/**
 * Custom hook for handling errors in components
 * Provides consistent error handling and user-friendly messages
 */
export const useErrorHandler = (options?: UseErrorHandlerOptions) => {
  const { showToast = false, logErrors = true, onError } = options || {};

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
    isRecoverable: false,
    recoverySuggestion: null,
  });

  /**
   * Handle an error
   */
  const captureError = useCallback(
    (error: any, context?: Record<string, any>) => {
      // Parse and handle error
      const errorInfo = handleError(error, context, {
        showToUser: showToast,
        logToConsole: logErrors,
      });

      // Get recovery suggestion
      const apiError = parseError(error);
      const recoverySuggestion = getRecoverySuggestion(apiError);

      // Update state
      setErrorState({
        error: errorInfo,
        hasError: true,
        isRecoverable: errorInfo.recoverable,
        recoverySuggestion,
      });

      // Call custom error handler if provided
      if (onError) {
        onError(errorInfo);
      }

      return errorInfo;
    },
    [showToast, logErrors, onError]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false,
      isRecoverable: false,
      recoverySuggestion: null,
    });
  }, []);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = useCallback(() => {
    return errorState.error?.userMessage || null;
  }, [errorState.error]);

  /**
   * Wrap async function with error handling
   */
  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      context?: Record<string, any>
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          clearError();
          return await fn(...args);
        } catch (error) {
          captureError(error, context);
          return null;
        }
      };
    },
    [captureError, clearError]
  );

  /**
   * Log info message
   */
  const logInfo = useCallback((message: string, context?: Record<string, any>) => {
    logger.info(message, context);
  }, []);

  /**
   * Log warning
   */
  const logWarning = useCallback((message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
  }, []);

  return {
    // Error state
    error: errorState.error,
    hasError: errorState.hasError,
    isRecoverable: errorState.isRecoverable,
    recoverySuggestion: errorState.recoverySuggestion,
    errorMessage: getErrorMessage(),

    // Error handlers
    captureError,
    clearError,
    withErrorHandling,

    // Logging
    logInfo,
    logWarning,
  };
};
