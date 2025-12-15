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
    padding: 20,
  },
  modalContent: {
    backgroundColor: neutral.neutral6,
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  modalMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: neutral.neutral3,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  button: {
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: neutral.neutral6,
    fontFamily: 'Poppins',
  },
});

export default AlertModal;
