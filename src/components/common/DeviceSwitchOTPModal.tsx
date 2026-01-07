import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { neutral, primary } from '@/constants/colors';
import { scale } from '@/utils/responsive';
import { typography, spacingScale, borderRadius, componentSizes } from '@/constants/responsive';
import OTPInput from './OTPInput';

interface DeviceSwitchOTPModalProps {
  visible: boolean;
  onVerify: (otp: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeviceSwitchOTPModal: React.FC<DeviceSwitchOTPModalProps> = ({
  visible,
  onVerify,
  onCancel,
  isLoading = false,
}) => {
  const [otp, setOtp] = useState('');

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
  };

  const handleVerify = async () => {
    if (otp.length === 6) {
      await onVerify(otp);
      setOtp('');
    }
  };

  const handleCancel = () => {
    setOtp('');
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
          <Text style={styles.modalTitle}>Device Verification Required</Text>
          <Text style={styles.modalMessage}>
            We've detected a login from a new device. Please enter the OTP sent to your registered phone number to verify.
          </Text>

          <View style={styles.otpContainer}>
            <OTPInput
              length={6}
              onComplete={handleOtpComplete}
              onChangeText={handleOtpChange}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, otp.length !== 6 && styles.disabledButton]}
              onPress={handleVerify}
              disabled={otp.length !== 6 || isLoading}>
              {isLoading ? (
                <ActivityIndicator color={neutral.neutral6} />
              ) : (
                <Text style={styles.confirmButtonText}>Verify</Text>
              )}
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
    maxWidth: scale(380),
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
  otpContainer: {
    marginBottom: spacingScale.xl,
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
  confirmButton: {
    backgroundColor: primary.primary1,
  },
  disabledButton: {
    opacity: 0.5,
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

export default DeviceSwitchOTPModal;
