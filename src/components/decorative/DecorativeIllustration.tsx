import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Bank, CreditCard, ArrowsLeftRight, ShieldCheck } from 'phosphor-react-native';
import { primary, semantic, neutral } from '@/constants/colors';

interface DecorativeIllustrationProps {
  size?: number;
  circleColor?: string;
  showDots?: boolean;
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
}

const DecorativeIllustration: React.FC<DecorativeIllustrationProps> = ({
  size = 180,
  showDots = true,
  containerStyle,
  children,
}) => {
  const circleSize = size;
  const containerWidth = size + 80;
  const containerHeight = size + 40;

  // Animations
  const floatAnimation = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);
  const scaleAnimation1 = useSharedValue(1);
  const scaleAnimation2 = useSharedValue(1);

  useEffect(() => {
    // Floating animation
    floatAnimation.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Rotation animation
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse animations for dots
    scaleAnimation1.value = withRepeat(
      withSequence(
        withSpring(1.3, { damping: 3 }),
        withSpring(1, { damping: 3 })
      ),
      -1,
      false
    );

    scaleAnimation2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withSpring(1.2, { damping: 4 }),
        withSpring(1, { damping: 4 })
      ),
      -1,
      false
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnimation.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnimation.value}deg` }],
  }));

  const pulseStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation1.value }],
  }));

  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation2.value }],
  }));

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }, containerStyle]}>
      <Animated.View style={[floatStyle, { width: circleSize, height: circleSize }]}>
        {/* Background circle with gradient */}
        <LinearGradient
          colors={[primary.primary1, primary.primary2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
        >
          {/* Inner circle */}
          <View style={styles.innerCircle}>
            {children || <Bank size={60} color={primary.primary1} weight="duotone" />}
          </View>
        </LinearGradient>

        {/* Rotating ring */}
        <Animated.View style={[styles.rotatingRing, rotateStyle]}>
          <View style={styles.ringSegment1} />
          <View style={styles.ringSegment2} />
        </Animated.View>
      </Animated.View>

      {showDots && (
        <>
          {/* Animated dots with icons */}
          <Animated.View style={[styles.iconDot, styles.dot1, pulseStyle1]}>
            <CreditCard size={16} color={neutral.neutral6} weight="bold" />
          </Animated.View>

          <Animated.View style={[styles.iconDot, styles.dot2, pulseStyle2]}>
            <ArrowsLeftRight size={20} color={neutral.neutral6} weight="bold" />
          </Animated.View>

          <Animated.View style={[styles.iconDot, styles.dot3, pulseStyle1]}>
            <ShieldCheck size={18} color={neutral.neutral6} weight="bold" />
          </Animated.View>

          {/* Small decorative dots */}
          <Animated.View style={[styles.smallDot, styles.smallDot1, pulseStyle2]} />
          <Animated.View style={[styles.smallDot, styles.smallDot2, pulseStyle1]} />
          <Animated.View style={[styles.smallDot, styles.smallDot3, pulseStyle2]} />
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
  innerCircle: {
    width: '70%',
    height: '70%',
    borderRadius: 1000,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: primary.primary1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rotatingRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSegment1: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 1000,
    borderWidth: 3,
    borderColor: 'white',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    opacity: 0.3,
  },
  ringSegment2: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: 'white',
    borderLeftColor: 'white',
    opacity: 0.2,
  },
  iconDot: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dot1: {
    top: 15,
    right: 10,
  },
  dot2: {
    bottom: 20,
    left: 5,
  },
  dot3: {
    top: 55,
    left: 0,
  },
  smallDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    opacity: 0.6,
  },
  smallDot1: {
    top: 10,
    left: 30,
  },
  smallDot2: {
    bottom: 15,
    right: 15,
  },
  smallDot3: {
    top: 90,
    right: 5,
  },
});

export default DecorativeIllustration;
