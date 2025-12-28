import { ApiError, parseError } from './error';
import { logger } from './logger';
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants';
import { ErrorCategory, ErrorSeverity, ErrorInfo } from '@/types/api';
import { isOffline } from './networkStatus';

/**
 * Enhanced error handler with user-friendly messages and recovery suggestions
 */

/**
 * Get error category from error code or status
 */
export const getErrorCategory = (error: ApiError): ErrorCategory => {
  if (error.status === 0 || isOffline()) {
    return ErrorCategory.NETWORK;
  }

  if (error.status === 401 || error.code === ERROR_CODES.UNAUTHORIZED) {
    return ErrorCategory.AUTHENTICATION;
  }

  if (error.status === 403 || error.code === ERROR_CODES.FORBIDDEN) {
    return ErrorCategory.AUTHORIZATION;
  }

  if (error.status === 400 || error.code === ERROR_CODES.VALIDATION_ERROR) {
    return ErrorCategory.VALIDATION;
  }

  if (error.status >= 500) {
    return ErrorCategory.SERVER;
  }

  if (error.status >= 400 && error.status < 500) {
    return ErrorCategory.CLIENT;
  }

  return ErrorCategory.UNKNOWN;
};

/**
 * Get error severity based on category and status
 */
export const getErrorSeverity = (error: ApiError): ErrorSeverity => {
  const category = getErrorCategory(error);

  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return ErrorSeverity.HIGH;

    case ErrorCategory.NETWORK:
      return ErrorSeverity.MEDIUM;

    case ErrorCategory.SERVER:
      return error.status >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH;

    case ErrorCategory.VALIDATION:
      return ErrorSeverity.LOW;

    default:
      return ErrorSeverity.MEDIUM;
  }
};

/**
 * Check if error is recoverable/retryable
 */
export const isRecoverable = (error: ApiError): boolean => {
  const category = getErrorCategory(error);

  // Network errors are recoverable (user can retry when online)
  if (category === ErrorCategory.NETWORK) {
    return true;
  }

  // Server errors might be temporary
  if (category === ErrorCategory.SERVER && error.status >= 500) {
    return true;
  }

  // Timeout errors are retryable (HTTP 408)
  if (error.status === 408) {
    return true;
  }

  return false;
};

/**
 * Check if error is retryable (can automatically retry)
 */
export const isRetryable = (error: ApiError): boolean => {
  // Network errors and timeouts are retryable
  if (error.status === 0 || error.status === 408) {
    return true;
  }

  // 502, 503, 504 are temporary server issues
  if ([502, 503, 504].includes(error.status)) {
    return true;
  }

  return false;
};

/**
 * Get user-friendly error message with recovery suggestions
 */
export const getUserFriendlyMessage = (error: ApiError): string => {
  const category = getErrorCategory(error);

  switch (category) {
    case ErrorCategory.NETWORK:
      return 'No internet connection. Please check your network and try again.';

    case ErrorCategory.AUTHENTICATION:
      return 'Your session has expired. Please log in again.';

    case ErrorCategory.AUTHORIZATION:
      return 'You do not have permission to perform this action.';

    case ErrorCategory.SERVER:
      return 'We are experiencing technical difficulties. Please try again later.';

    case ErrorCategory.VALIDATION:
      return error.message || 'Please check your input and try again.';

    default:
      return error.message || ERROR_MESSAGES.GENERIC_ERROR;
  }
};

/**
 * Get recovery suggestion for error
 */
export const getRecoverySuggestion = (error: ApiError): string | null => {
  const category = getErrorCategory(error);

  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Check your internet connection and try again';

    case ErrorCategory.AUTHENTICATION:
      return 'Please log in again to continue';

    case ErrorCategory.SERVER:
      return isRetryable(error)
        ? 'This is a temporary issue. Please try again in a few moments'
        : 'Please contact support if this issue persists';

    case ErrorCategory.VALIDATION:
      return 'Review your input and correct any errors';

    default:
      return isRecoverable(error) ? 'Try again' : null;
  }
};

/**
 * Create enhanced error info from ApiError
 */
export const createErrorInfo = (error: ApiError, context?: Record<string, any>): ErrorInfo => {
  const category = getErrorCategory(error);
  const severity = getErrorSeverity(error);
  const recoverable = isRecoverable(error);
  const retryable = isRetryable(error);
  const userMessage = getUserFriendlyMessage(error);

  return {
    message: error.message,
    code: error.code,
    category,
    severity,
    recoverable,
    retryable,
    userMessage,
    technicalMessage: __DEV__ ? error.message : undefined,
    timestamp: new Date().toISOString(),
    context,
  };
};

/**
 * Handle error with logging and user notification
 */
export const handleError = (
  error: any,
  context?: Record<string, any>,
  options?: {
    showToUser?: boolean;
    logToConsole?: boolean;
    sendToTracking?: boolean;
  }
): ErrorInfo => {
  const { showToUser = true, logToConsole = true, sendToTracking = true } = options || {};

  // Parse error to ApiError
  const apiError = error instanceof ApiError ? error : parseError(error);

  // Create error info
  const errorInfo = createErrorInfo(apiError, context);

  // Log error
  if (logToConsole) {
    logger.error(errorInfo.userMessage, error, {
      ...context,
      category: errorInfo.category,
      severity: errorInfo.severity,
      code: errorInfo.code,
    });
  }

  // TODO: Send to error tracking service if enabled
  if (sendToTracking && errorInfo.severity >= ErrorSeverity.HIGH) {
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  return errorInfo;
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  }
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options || {};

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      const apiError = error instanceof ApiError ? error : parseError(error);
      if (!isRetryable(apiError)) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);

      logger.debug(`Retrying request (attempt ${attempt + 1}/${maxRetries})`, {
        delay,
        error: apiError.message,
      });
    }
  }

  throw lastError;
};
