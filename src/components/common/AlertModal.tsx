import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { neutral, primary } from '@/constants/colors';
import { scale } from '@/utils/responsive';
import { typography, spacingScale, borderRadius, componentSizes } from '@/constants/responsive';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  variant?: 'info' | 'success' | 'error' | 'warning';
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttonText = 'OK',
  onClose,
  variant = 'info',
}) => {
  const getButtonColor = () => {
    switch (variant) {
      case 'success':
        return '#40C957';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return primary.primary1;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: getButtonColor() }]}
            onPress={onClose}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </Pressable>
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
    padding: spacingScale.lg,
  },
  modalContent: {
    backgroundColor: neutral.neutral6,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: scale(340),
    padding: spacingScale.xl,
  },
  modalTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: spacingScale.md,
    fontFamily: 'Poppins',
  },
  modalMessage: {
    fontSize: typography.bodySmall,
    fontWeight: '400',
    color: neutral.neutral3,
    textAlign: 'center',
    lineHeight: spacingScale.lg + 4,
    marginBottom: spacingScale.xl,
    fontFamily: 'Poppins',
  },
  button: {
    height: componentSizes.inputHeight,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: neutral.neutral6,
    fontFamily: 'Poppins',
  },
});

export default AlertModal;
