/**
 * Security Utilities for FortressBank Mobile App
 * 
 * Defensive security measures for production hardening.
 * OWASP Mobile Top 10 coverage.
 */

import { Platform, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Application from "expo-application";

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  // Session timeout after app goes to background (ms)
  SESSION_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  
  // Maximum failed biometric attempts before lockout
  MAX_BIOMETRIC_FAILURES: 5,
  
  // Clipboard auto-clear delay (ms)
  CLIPBOARD_CLEAR_DELAY_MS: 30 * 1000, // 30 seconds
  
  // Sensitive data mask character
  MASK_CHAR: "•",
};

/**
 * Check if app is running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  return __DEV__ === true;
};

/**
 * Check if debugger is attached (basic detection)
 * Note: More sophisticated detection requires native modules
 */
export const isDebuggerAttached = (): boolean => {
  // In React Native, __DEV__ is a good proxy for debug mode
  // Production builds should have this as false
  return __DEV__ === true;
};

/**
 * Mask sensitive data for display
 * @param value - The value to mask
 * @param showLast - Number of characters to show at end
 * @returns Masked string
 */
export const maskSensitiveData = (
  value: string,
  showLast: number = 4
): string => {
  if (!value || value.length <= showLast) {
    return SECURITY_CONFIG.MASK_CHAR.repeat(value?.length || 4);
  }
  
  const visiblePart = value.slice(-showLast);
  const maskedPart = SECURITY_CONFIG.MASK_CHAR.repeat(value.length - showLast);
  return maskedPart + visiblePart;
};

/**
 * Mask account number for display
 * @param accountNumber - Full account number
 * @returns Masked account number (e.g., ••••••1234)
 */
export const maskAccountNumber = (accountNumber: string): string => {
  return maskSensitiveData(accountNumber, 4);
};

/**
 * Mask card number for display
 * @param cardNumber - Full card number
 * @returns Masked card number (e.g., •••• •••• •••• 1234)
 */
export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (cleaned.length !== 16) {
    return maskSensitiveData(cleaned, 4);
  }
  return `${SECURITY_CONFIG.MASK_CHAR.repeat(4)} ${SECURITY_CONFIG.MASK_CHAR.repeat(4)} ${SECURITY_CONFIG.MASK_CHAR.repeat(4)} ${cleaned.slice(-4)}`;
};

/**
 * Secure memory wipe for sensitive strings
 * Note: JavaScript doesn't guarantee memory wiping, but this is best effort
 * @param sensitiveData - Object containing sensitive data to clear
 */
export const secureClear = (sensitiveData: Record<string, any>): void => {
  for (const key in sensitiveData) {
    if (typeof sensitiveData[key] === "string") {
      // Overwrite with random data before clearing
      sensitiveData[key] = Math.random().toString(36);
      sensitiveData[key] = "";
    }
    sensitiveData[key] = null;
  }
};

/**
 * Validate that a string doesn't contain injection patterns
 * @param input - User input to validate
 * @returns True if safe, false if potentially malicious
 */
export const isSafeInput = (input: string): boolean => {
  if (!input || typeof input !== "string") return true;
  
  // Check for common injection patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /data:/gi, // Data URLs
    /vbscript:/gi, // VBScript
    /<iframe/gi, // iframes
    /eval\(/gi, // eval
    /expression\(/gi, // CSS expression
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      console.warn("Potentially dangerous input detected");
      return false;
    }
  }
  
  return true;
};

/**
 * Sanitize user input for safe storage/transmission
 * @param input - Raw user input
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== "string") return "";
  
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/["']/g, "") // Remove quotes
    .trim();
};

/**
 * Generate a cryptographically strong random string
 * @param length - Desired length
 * @returns Random string
 */
export const generateSecureRandom = (length: number = 32): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  
  // Use crypto.getRandomValues if available
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback (less secure)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
};

/**
 * Track failed authentication attempts
 */
const FAILED_ATTEMPTS_KEY = "fortressbank_failed_auth_attempts";
const LOCKOUT_UNTIL_KEY = "fortressbank_lockout_until";

export const recordFailedAttempt = async (): Promise<number> => {
  try {
    const current = await SecureStore.getItemAsync(FAILED_ATTEMPTS_KEY);
    const attempts = (parseInt(current || "0", 10) || 0) + 1;
    await SecureStore.setItemAsync(FAILED_ATTEMPTS_KEY, attempts.toString());
    
    // Check if should lock out
    if (attempts >= SECURITY_CONFIG.MAX_BIOMETRIC_FAILURES) {
      const lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
      await SecureStore.setItemAsync(LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
    }
    
    return attempts;
  } catch (error) {
    console.error("Error recording failed attempt:", error);
    return 0;
  }
};

export const resetFailedAttempts = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(FAILED_ATTEMPTS_KEY);
    await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
  } catch (error) {
    console.error("Error resetting failed attempts:", error);
  }
};

export const isLockedOut = async (): Promise<boolean> => {
  try {
    const lockoutUntil = await SecureStore.getItemAsync(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntil) return false;
    
    const lockoutTime = parseInt(lockoutUntil, 10);
    if (Date.now() < lockoutTime) {
      return true;
    }
    
    // Lockout expired, clear it
    await resetFailedAttempts();
    return false;
  } catch (error) {
    return false;
  }
};

export const getLockoutRemainingSeconds = async (): Promise<number> => {
  try {
    const lockoutUntil = await SecureStore.getItemAsync(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntil) return 0;
    
    const lockoutTime = parseInt(lockoutUntil, 10);
    const remaining = Math.max(0, Math.ceil((lockoutTime - Date.now()) / 1000));
    return remaining;
  } catch (error) {
    return 0;
  }
};

/**
 * Get app integrity information
 */
export const getAppIntegrityInfo = async (): Promise<{
  bundleId: string | null;
  version: string | null;
  buildNumber: string | null;
}> => {
  return {
    bundleId: Application.applicationId,
    version: Application.nativeApplicationVersion,
    buildNumber: Application.nativeBuildVersion,
  };
};

/**
 * Timing-safe string comparison
 * Prevents timing attacks on sensitive comparisons
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    // Still compare to prevent length-based timing
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

/**
 * Show security warning alert
 */
export const showSecurityWarning = (
  title: string,
  message: string,
  onDismiss?: () => void
): void => {
  Alert.alert(
    `⚠️ ${title}`,
    message,
    [{ text: "OK", onPress: onDismiss }],
    { cancelable: false }
  );
};

/**
 * Log security event (for audit trail)
 */
export const logSecurityEvent = (
  eventType: "AUTH_SUCCESS" | "AUTH_FAILURE" | "LOCKOUT" | "SUSPICIOUS_ACTIVITY" | "KEY_GENERATED" | "DEVICE_REGISTERED",
  details?: Record<string, any>
): void => {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    platform: Platform.OS,
    ...details,
  };
  
  // In production, send to analytics/audit service
  if (!__DEV__) {
    // TODO: Send to audit service
    console.log("[SECURITY_AUDIT]", JSON.stringify(event));
  } else {
    console.log("[SECURITY_EVENT]", event);
  }
};
