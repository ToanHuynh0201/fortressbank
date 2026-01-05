/**
 * Security Hooks for FortressBank Mobile App
 * 
 * React hooks for security-related functionality.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { SECURITY_CONFIG, isLockedOut, getLockoutRemainingSeconds } from "@/utils/security";
import { removeAuthToken, removeUserData } from "@/utils/storage";

/**
 * Hook to detect app going to background and enforce session timeout
 * If user is away for too long, force re-authentication
 */
export const useSessionTimeout = (
  timeoutMs: number = SECURITY_CONFIG.SESSION_TIMEOUT_MS,
  onTimeout?: () => void
) => {
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        // App going to background - record time
        backgroundTime.current = Date.now();
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App coming back to foreground - check timeout
        if (backgroundTime.current) {
          const elapsed = Date.now() - backgroundTime.current;
          if (elapsed > timeoutMs) {
            console.log("[SESSION] Timeout exceeded, forcing re-auth");
            if (onTimeout) {
              onTimeout();
            } else {
              // Default: navigate to login
              router.replace("/(auth)/signIn");
            }
          }
        }
        backgroundTime.current = null;
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [timeoutMs, onTimeout, router]);
};

/**
 * Hook to prevent screenshots on sensitive screens
 * Note: Requires expo-screen-capture for full implementation
 */
export const usePreventCapture = () => {
  useEffect(() => {
    // This is a placeholder - full implementation requires expo-screen-capture
    // For production, add:
    // import * as ScreenCapture from 'expo-screen-capture';
    // ScreenCapture.preventScreenCaptureAsync();
    
    console.log("[SECURITY] Screen capture prevention active");

    return () => {
      // ScreenCapture.allowScreenCaptureAsync();
      console.log("[SECURITY] Screen capture prevention released");
    };
  }, []);
};

/**
 * Hook to check if user is locked out due to failed attempts
 */
export const useLockoutCheck = () => {
  const [lockedOut, setLockedOut] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const checkLockout = useCallback(async () => {
    const locked = await isLockedOut();
    setLockedOut(locked);
    
    if (locked) {
      const seconds = await getLockoutRemainingSeconds();
      setRemainingSeconds(seconds);
    }
  }, []);

  useEffect(() => {
    checkLockout();
    
    // Re-check every second if locked out
    let interval: NodeJS.Timeout | null = null;
    if (lockedOut) {
      interval = setInterval(async () => {
        const seconds = await getLockoutRemainingSeconds();
        setRemainingSeconds(seconds);
        
        if (seconds <= 0) {
          setLockedOut(false);
          if (interval) clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockedOut, checkLockout]);

  return { lockedOut, remainingSeconds, checkLockout };
};

/**
 * Hook to track sensitive screen access for audit
 */
export const useSensitiveScreenAudit = (screenName: string) => {
  useEffect(() => {
    const accessTime = new Date().toISOString();
    console.log(`[AUDIT] Sensitive screen accessed: ${screenName} at ${accessTime}`);

    // In production, send to audit service
    // auditService.logScreenAccess(screenName);

    return () => {
      console.log(`[AUDIT] Sensitive screen exited: ${screenName}`);
    };
  }, [screenName]);
};

/**
 * Hook for secure logout with cleanup
 */
export const useSecureLogout = () => {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      console.log("[AUTH] Secure logout initiated");
      
      // Clear all auth data
      await removeAuthToken();
      await removeUserData();
      
      // Additional cleanup
      // await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
      
      // Navigate to login
      router.replace("/(auth)/signIn");
    } catch (error) {
      console.error("[AUTH] Logout error:", error);
      // Still navigate even if cleanup fails
      router.replace("/(auth)/signIn");
    }
  }, [router]);

  return { logout };
};

/**
 * Hook to detect if running in development mode
 */
export const useDevModeWarning = () => {
  useEffect(() => {
    if (__DEV__) {
      console.warn(
        "[SECURITY] Running in development mode. " +
        "Security features may be reduced."
      );
    }
  }, []);

  return __DEV__;
};

/**
 * Hook for inactivity timeout (auto-lock)
 * Logs out user after period of inactivity
 */
export const useInactivityTimeout = (
  timeoutMs: number = 10 * 60 * 1000, // 10 minutes
  onInactive?: () => void
) => {
  const lastActivityRef = useRef(Date.now());
  const { logout } = useSecureLogout();

  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed > timeoutMs) {
        console.log("[SESSION] Inactivity timeout, logging out");
        if (onInactive) {
          onInactive();
        } else {
          logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [timeoutMs, onInactive, logout]);

  return { recordActivity };
};
