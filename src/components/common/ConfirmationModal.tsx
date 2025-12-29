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

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonVariant?: 'primary' | 'danger';
  showCancelButton?: boolean;
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
  showCancelButton = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={showCancelButton ? onCancel : undefined}>
      <Pressable style={styles.modalOverlay} onPress={showCancelButton ? onCancel : undefined}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.modalActions}>
            {showCancelButton && (
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
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
  modalActions: {
    flexDirection: 'row',
    gap: spacingScale.md,
  },
  modalButton: {
    flex: 1,
    height: componentSizes.inputHeight,
    borderRadius: borderRadius.lg,
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
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: neutral.neutral1,
    fontFamily: 'Poppins',
  },
  confirmButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: neutral.neutral6,
    fontFamily: 'Poppins',
  },
});

export default ConfirmationModal;
