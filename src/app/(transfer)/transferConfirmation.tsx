import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CaretLeft, Check } from 'phosphor-react-native';
import colors from '@/constants/colors';
import { ScreenContainer, PrimaryButton } from '@/components';

const TransferConfirmation = () => {
  const router = useRouter();

  const transferDetails = [
    { label: 'Transfer type', value: 'Transfer via card number' },
    { label: 'Beneficiary', value: 'Capi Creative Design' },
    { label: 'Card number', value: '0123 4567 8910 9' },
    { label: 'Amount', value: '$1,000' },
    { label: 'Content', value: 'Payment for services' },
    { label: 'From account', value: 'VISA **** **** **** 1234' },
    { label: 'Fee', value: '$0' },
    { label: 'Total', value: '$1,000', highlight: true },
  ];

  return (
    <ScreenContainer backgroundColor={colors.neutral.neutral6}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <CaretLeft size={16} color={colors.neutral.neutral1} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Check size={48} color={colors.neutral.neutral6} weight="bold" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Transfer Confirmation</Text>
        <Text style={styles.subtitle}>Please review the details before confirming</Text>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {transferDetails.map((detail, index) => (
            <View key={index}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={[
                  styles.detailValue,
                  detail.highlight && styles.detailValueHighlight,
                ]}>
                  {detail.value}
                </Text>
              </View>
              {index < transferDetails.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            By confirming, you agree to transfer the amount specified above. This action cannot be undone.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <PrimaryButton
            title="Confirm Transfer"
            onPress={() => {
              // Handle transfer confirmation
              console.log('Transfer confirmed');
              router.push('(transfer)/transferSuccess');
            }}
            style={styles.confirmButton}
          />
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    height: 53,
    backgroundColor: colors.neutral.neutral6,
  },
  backButton: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.neutral.neutral1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.primary1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.neutral.neutral1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.neutral.neutral3,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 15,
    padding: 20,
    shadowColor: 'rgba(54, 41, 183, 0.07)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 5,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.neutral.neutral3,
    flex: 1,
  },
  detailValue: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.neutral.neutral1,
    textAlign: 'right',
    flex: 1,
  },
  detailValueHighlight: {
    color: colors.primary.primary1,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.neutral5,
  },
  noteContainer: {
    backgroundColor: colors.primary.primary4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  noteText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.neutral.neutral1,
  },
  buttonsContainer: {
    gap: 16,
  },
  confirmButton: {
    height: 48,
  },
  cancelButton: {
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.neutral4,
  },
  cancelButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.neutral1,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.neutral6,
  },
  indicator: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.neutral.neutral4,
  },
});

export default TransferConfirmation;
