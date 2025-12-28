import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Network status utility for detecting and handling offline/online states
 */

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

// Global network status listeners
const listeners: Set<(status: NetworkStatus) => void> = new Set();

let currentNetworkStatus: NetworkStatus = {
  isConnected: true,
  isInternetReachable: null,
  type: null,
};

// Subscribe to network changes
NetInfo.addEventListener((state: NetInfoState) => {
  const newStatus: NetworkStatus = {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
  };

  currentNetworkStatus = newStatus;

  // Notify all listeners
  listeners.forEach(listener => listener(newStatus));
});

/**
 * Get current network status
 */
export const getNetworkStatus = (): NetworkStatus => {
  return currentNetworkStatus;
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return currentNetworkStatus.isConnected &&
         (currentNetworkStatus.isInternetReachable ?? true);
};

/**
 * Check if device is offline
 */
export const isOffline = (): boolean => {
  return !isOnline();
};

/**
 * Subscribe to network status changes
 */
export const subscribeToNetworkStatus = (
  callback: (status: NetworkStatus) => void
): (() => void) => {
  listeners.add(callback);

  // Return unsubscribe function
  return () => {
    listeners.delete(callback);
  };
};

/**
 * React hook for network status
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(currentNetworkStatus);

  useEffect(() => {
    // Set initial status
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Subscribe to changes
    const unsubscribe = subscribeToNetworkStatus(setNetworkStatus);

    return unsubscribe;
  }, []);

  return {
    ...networkStatus,
    isOnline: networkStatus.isConnected && (networkStatus.isInternetReachable ?? true),
    isOffline: !networkStatus.isConnected || networkStatus.isInternetReachable === false,
  };
};

/**
 * Wait for network to be online
 */
export const waitForOnline = (timeoutMs = 30000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = subscribeToNetworkStatus((status) => {
      if (status.isConnected && (status.isInternetReachable ?? true)) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
};
