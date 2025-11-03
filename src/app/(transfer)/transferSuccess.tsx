import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Download, Share } from 'phosphor-react-native';
import colors from '@/constants/colors';
import { ScreenContainer, PrimaryButton } from '@/components';

const TransferSuccess = () => {
  const router = useRouter();

  const transferInfo = [
    { label: 'Transaction ID', value: 'TXN123456789' },
    { label: 'Date', value: 'Nov 3, 2025 10:30 AM' },
    { label: 'Amount', value: '$1,000' },
    { label: 'Beneficiary', value: 'Capi Creative Design' },
  ];

  return (
    <ScreenContainer backgroundColor={colors.neutral.neutral6}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <CheckCircle size={100} color={colors.primary.primary1} weight="fill" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Transfer Successful!</Text>
        <Text style={styles.subtitle}>
          Your money has been transferred successfully
        </Text>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          {transferInfo.map((info, index) => (
            <View key={index} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={24} color={colors.primary.primary1} weight="regular" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share size={24} color={colors.primary.primary1} weight="regular" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Done Button */}
        <PrimaryButton
          title="Done"
          onPress={() => {
            router.replace('(home)');
          }}
          style={styles.doneButton}
        />

        {/* Make Another Transfer */}
        <TouchableOpacity
          style={styles.anotherTransferButton}
          onPress={() => {
            router.replace('(transfer)/transfer');
          }}
        >
          <Text style={styles.anotherTransferText}>Make Another Transfer</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    color: colors.neutral.neutral1,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.neutral.neutral3,
    textAlign: 'center',
    marginBottom: 40,
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
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.neutral5,
  },
  infoLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.neutral.neutral3,
  },
  infoValue: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.neutral.neutral1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    height: 60,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary.primary1,
    backgroundColor: colors.neutral.neutral6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary.primary1,
  },
  doneButton: {
    height: 48,
    marginBottom: 16,
  },
  anotherTransferButton: {
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.neutral4,
  },
  anotherTransferText: {
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

export default TransferSuccess;
