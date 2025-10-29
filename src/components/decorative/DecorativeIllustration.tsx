import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { primary, semantic } from '@/constants/colors';

interface DecorativeIllustrationProps {
  size?: number;
  circleColor?: string;
  showDots?: boolean;
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
}

const DecorativeIllustration: React.FC<DecorativeIllustrationProps> = ({
  size = 150,
  circleColor = primary.primary4,
  showDots = true,
  containerStyle,
  children,
}) => {
  const circleSize = size;
  const containerWidth = size + 63;
  const containerHeight = size + 15;

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }, containerStyle]}>
      <View style={[styles.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2, backgroundColor: circleColor }]}>
        {children}
      </View>
      {showDots && (
        <>
          <View style={[styles.dot, styles.dot1, { backgroundColor: semantic.info }]} />
          <View style={[styles.dot, styles.dot2, { backgroundColor: semantic.error }]} />
          <View style={[styles.dot, styles.dot3, { backgroundColor: semantic.warning }]} />
          <View style={[styles.dot, styles.dot4, { backgroundColor: semantic.success }]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    borderRadius: 50,
  },
  dot1: {
    width: 10,
    height: 10,
    top: 65,
    left: 0,
  },
  dot2: {
    width: 25,
    height: 25,
    top: 22,
    right: 0,
  },
  dot3: {
    width: 20,
    height: 20,
    bottom: 34,
    left: 42,
  },
  dot4: {
    width: 10,
    height: 10,
    bottom: 34,
    right: 35,
  },
});

export default DecorativeIllustration;
