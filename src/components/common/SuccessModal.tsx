import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { CheckCircle } from 'phosphor-react-native';
import { neutral, primary } from '@/constants/colors';
import PrimaryButton from './PrimaryButton';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  details: Array<{ label: string; value: string }>;
  buttonText?: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  subtitle,
  details,
  buttonText = 'Done',
  onClose,
}) => {
  // Animation values
  const overlayOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Overlay fade in
      overlayOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      // Content card scale and fade in
      contentOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
      contentScale.value = withSpring(1, {
        damping: 20,
        stiffness: 90,
      });

      // Checkmark bounce animation with delay
      checkmarkScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 6, stiffness: 120 }),
          withSpring(1, { damping: 10, stiffness: 140 })
        )
      );
    } else {
      // Reset animations when modal closes
      overlayOpacity.value = 0;
      contentScale.value = 0.9;
      contentOpacity.value = 0;
      checkmarkScale.value = 0;
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View style={[styles.modalOverlay, overlayAnimatedStyle]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.modalContent, contentAnimatedStyle]}>
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Animated.View style={checkmarkAnimatedStyle}>
                  <CheckCircle
                    size={64}
                    color="#40C957"
                    weight="fill"
                  />
                </Animated.View>
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>{title}</Text>

              {/* Subtitle */}
              {subtitle && (
                <Text style={styles.modalSubtitle}>{subtitle}</Text>
              )}

              {/* Details Card */}
              <View style={styles.detailsCard}>
                {details.map((detail, index) => (
                  <View
                    key={index}
                    style={[
                      styles.detailRow,
                      index < details.length - 1 && styles.detailRowBorder,
                    ]}>
                    <Text style={styles.detailLabel}>{detail.label}</Text>
                    <Text style={styles.detailValue}>{detail.value}</Text>
                  </View>
                ))}
              </View>

              {/* Button */}
              <PrimaryButton
                title={buttonText}
                onPress={onClose}
                style={styles.button}
              />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: neutral.neutral6,
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: neutral.neutral3,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: primary.primary4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 63, 219, 0.1)',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: neutral.neutral2,
    fontFamily: 'Poppins',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: neutral.neutral1,
    fontFamily: 'Poppins',
  },
  button: {
    width: '100%',
  },
});

export default SuccessModal;
