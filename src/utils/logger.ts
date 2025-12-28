/**
 * Structured logging utility to replace console.error/log/warn
 * Provides consistent logging format and can be integrated with error tracking services
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
}

class Logger {
  private isDevelopment = __DEV__;

  /**
   * Format log entry for display
   */
  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      formatted += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    if (entry.error) {
      formatted += `\nError: ${entry.error.message}`;
      if (entry.stack) {
        formatted += `\nStack: ${entry.stack}`;
      }
    }

    return formatted;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      stack: error?.stack,
    };
  }

  /**
   * Send log to external service (Sentry, LogRocket, etc.)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // TODO: Implement integration with error tracking service
    // Example: Sentry.captureMessage(entry.message, { level: entry.level, extra: entry.context });

    // For now, just log to console in production
    if (!this.isDevelopment && entry.level === LogLevel.ERROR) {
      // In production, you would send to your error tracking service
      // await sendToSentry(entry);
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    console.log(this.formatLog(entry));
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    console.log(this.formatLog(entry));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    console.warn(this.formatLog(entry));
    this.sendToExternalService(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    console.error(this.formatLog(entry));
    this.sendToExternalService(entry);
  }

  /**
   * Log fatal error (critical system failure)
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, context, error);
    console.error('🔴 FATAL:', this.formatLog(entry));
    this.sendToExternalService(entry);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext): void {
    if (!this.isDevelopment) return;

    this.debug(`API Request: ${method} ${url}`, context);
  }

  /**
   * Log API response
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    context?: LogContext
  ): void {
    if (!this.isDevelopment) return;

    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    const message = `API Response: ${method} ${url} - Status: ${status}`;

    if (level === LogLevel.ERROR) {
      this.error(message, undefined, context);
    } else {
      this.debug(message, context);
    }
  }

  /**
   * Log network error
   */
  networkError(message: string, error?: Error, context?: LogContext): void {
    this.error(`Network Error: ${message}`, error, {
      ...context,
      category: 'network',
    });
  }

  /**
   * Log authentication error
   */
  authError(message: string, error?: Error, context?: LogContext): void {
    this.error(`Auth Error: ${message}`, error, {
      ...context,
      category: 'authentication',
    });
  }

  /**
   * Log validation error
   */
  validationError(message: string, context?: LogContext): void {
    this.warn(`Validation Error: ${message}`, {
      ...context,
      category: 'validation',
    });
  }

  /**
   * Log user action (analytics)
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, context);
    // TODO: Send to analytics service (Firebase, Mixpanel, etc.)
  }

  /**
   * Group related logs (for debugging)
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common patterns
export const logError = (message: string, error?: Error, context?: LogContext) =>
  logger.error(message, error, context);

export const logWarning = (message: string, context?: LogContext) =>
  logger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context);

export const logDebug = (message: string, context?: LogContext) =>
  logger.debug(message, context);
