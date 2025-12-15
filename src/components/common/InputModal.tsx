import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { neutral, primary } from '@/constants/colors';

interface InputModalProps {
  visible: boolean;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  secureTextEntry?: boolean;
}

const InputModal: React.FC<InputModalProps> = ({
  visible,
  title,
  message,
  placeholder = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  secureTextEntry = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue('');
  };

  const handleCancel = () => {
    setInputValue('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}>
      <Pressable style={styles.modalOverlay} onPress={handleCancel}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            placeholderTextColor={neutral.neutral3}
            secureTextEntry={secureTextEntry}
            autoFocus
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirm}>
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
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  input: {
    backgroundColor: neutral.neutral5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    fontFamily: 'Poppins',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: neutral.neutral4,
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
  confirmButton: {
    backgroundColor: primary.primary1,
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

export default InputModal;
