import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import CustomInput from './CustomInput';
import colors from '@/constants/colors';
import { getBeneficiaryName } from '@/lib/mockTransferApi';

interface AccountNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBeneficiaryFound?: (name: string) => void;
  onBeneficiaryNotFound?: () => void;
  containerStyle?: any;
  placeholder?: string;
}

/**
 * Account number input with auto-fetch beneficiary name
 * Uses debouncing to avoid excessive API calls
 */
const AccountNumberInput: React.FC<AccountNumberInputProps> = ({
  value,
  onChangeText,
  onBeneficiaryFound,
  onBeneficiaryNotFound,
  containerStyle,
  placeholder = 'Account number',
}) => {
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Debounce timer
  useEffect(() => {
    // Clear previous states when input changes
    setBeneficiaryName('');
    setError('');
    setShowErrorModal(false);

    // Only fetch if account number has 10-12 digits
    const cleanedValue = value.replace(/\s/g, '');
    if (cleanedValue.length < 10 || cleanedValue.length > 12) {
      return;
    }

    setIsLoading(true);

    // Debounce: wait 1000ms (1 second) after user stops typing
    const timer = setTimeout(async () => {
      try {
        const result = await getBeneficiaryName(cleanedValue);
        
        if (result.success && result.data) {
          setBeneficiaryName(result.data.name);
          onBeneficiaryFound?.(result.data.name);
          setError('');
        } else {
          setBeneficiaryName('');
          onBeneficiaryNotFound?.();
          setError(result.error || 'Account not found');
          setShowErrorModal(true); // Show modal on error
        }
      } catch (err) {
        setBeneficiaryName('');
        onBeneficiaryNotFound?.();
        setError('Failed to fetch account information');
        setShowErrorModal(true); // Show modal on error
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Changed from 800ms to 1000ms

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [value]); // Remove onBeneficiaryFound and onBeneficiaryNotFound from dependencies

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputWrapper}>
        <CustomInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          maxLength={12}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary.primary1} />
          </View>
        )}
      </View>

      {/* Beneficiary name display */}
      {beneficiaryName && !isLoading && (
        <View style={styles.beneficiaryInfo}>
          <Text style={styles.beneficiaryLabel}>Account holder:</Text>
          <Text style={styles.beneficiaryName}>{beneficiaryName}</Text>
        </View>
      )}

      {/* Error display */}
      {error && !isLoading && value.replace(/\s/g, '').length >= 10 && (
        <View style={styles.errorInfo}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>⚠️</Text>
            </View>
            
            <Text style={styles.modalTitle}>Account Not Found</Text>
            <Text style={styles.modalMessage}>
              {error || 'The account number you entered does not exist. Please check and try again.'}
            </Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  beneficiaryInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.primary.primary4,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.primary1,
  },
  beneficiaryLabel: {
    fontFamily: 'Poppins',
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral.neutral3,
    marginBottom: 4,
  },
  beneficiaryName: {
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary.primary1,
  },
  errorInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.error,
  },
  errorText: {
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '500',
    color: colors.semantic.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.neutral1,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    color: colors.neutral.neutral3,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary.primary1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.neutral6,
  },
});

export default AccountNumberInput;
