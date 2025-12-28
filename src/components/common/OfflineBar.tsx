import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/utils/networkStatus';

/**
 * OfflineBar component that displays a banner when device is offline
 * Automatically shows/hides based on network status
 */
export const OfflineBar: React.FC = () => {
  const { isOffline } = useNetworkStatus();
  const [slideAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    if (isOffline) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      // Slide up
      Animated.spring(slideAnim, {
        toValue: -60,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [isOffline]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <MaterialIcons name="wifi-off" size={20} color="#fff" />
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
