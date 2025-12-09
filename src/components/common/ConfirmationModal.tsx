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

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonVariant?: 'primary' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  confirmButtonVariant = 'primary',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                confirmButtonVariant === 'danger'
                  ? styles.confirmButtonDanger
                  : styles.confirmButtonPrimary,
              ]}
              onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: neutral.neutral5,
    borderWidth: 1,
    borderColor: neutral.neutral4,
  },
  confirmButtonPrimary: {
    backgroundColor: primary.primary1,
  },
  confirmButtonDanger: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: neutral.neutral1,
    fontFamily: 'Poppins',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: neutral.neutral6,
    fontFamily: 'Poppins',
  },
});

export default ConfirmationModal;
