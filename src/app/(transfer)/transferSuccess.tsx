import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { CheckCircle, Download, Share, House, ArrowCounterClockwise } from 'phosphor-react-native';
import colors from '@/constants/colors';
import { ScreenContainer, PrimaryButton } from '@/components';
import { scale, fontSize, spacing } from '@/utils/responsive';

const TransferSuccess = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    transactionId: string;
    amount: string;
    receiverAccountNumber: string;
    senderAccountNumber: string;
    transactionType: string;
    createdAt: string;
    status: string;
    feeAmount: string;
    description?: string;
    recipientName?: string;
    bankName?: string;
  }>();

  // Animation values
  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    // Icon container animation
    iconOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    iconScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );

    // Checkmark animation with delay
    checkmarkScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.3, { damping: 6, stiffness: 120 }),
        withSpring(1, { damping: 10, stiffness: 140 })
      )
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  // Format date from ISO string
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Format amount with proper currency
  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Shorten transaction ID for display
  const shortenTransactionId = (txId: string) => {
    if (!txId || txId.length <= 20) return txId;
    const start = txId.substring(0, 8);
    const end = txId.substring(txId.length - 8);
    return `${start}...${end}`;
  };

  // Build transfer info array dynamically
  const transferInfo = [
    { label: 'Transaction ID', value: shortenTransactionId(params.transactionId || 'N/A') },
    { label: 'Date', value: formatDate(params.createdAt || new Date().toISOString()) },
    { label: 'Amount', value: formatAmount(params.amount || '0') },
    { label: 'Beneficiary', value: params.recipientName || 'N/A' },
    { label: 'Account Number', value: params.receiverAccountNumber || 'N/A' },
    {
      label: 'Transfer Type',
      value: params.transactionType === 'INTERNAL_TRANSFER' ? 'Internal Transfer' : 'External Transfer'
    },
  ];

  // Add bank name if it's external transfer
  if (params.bankName && params.transactionType === 'EXTERNAL_TRANSFER') {
    transferInfo.push({ label: 'Bank', value: params.bankName });
  }

  // Add description if present
  if (params.description && params.description.trim()) {
    transferInfo.push({ label: 'Message', value: params.description });
  }

  return (
    <ScreenContainer backgroundColor={colors.neutral.neutral6}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        {/* Success Icon with Animation */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <View style={styles.iconBackground}>
            <Animated.View style={checkmarkAnimatedStyle}>
              <CheckCircle size={scale(80)} color={colors.primary.primary1} weight="fill" />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.messageContainer}>
          <Text style={styles.title}>Transfer Successful!</Text>
          <Text style={styles.subtitle}>
            Your money has been transferred successfully
          </Text>
        </Animated.View>

        {/* Transaction Details */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.detailsCard}>
          {transferInfo.map((info, index) => (
            <View
              key={index}
              style={[
                styles.infoRow,
                index === transferInfo.length - 1 && styles.infoRowLast
              ]}>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Download size={scale(22)} color={colors.primary.primary1} weight="bold" />
            </View>
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Share size={scale(22)} color={colors.primary.primary1} weight="bold" />
            </View>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Buttons Container */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.buttonsContainer}>
          {/* Back to Home Button */}
          <PrimaryButton
            title="Back to Home"
            onPress={() => {
              router.replace('(home)');
            }}
            style={styles.homeButton}
          />

          {/* Make Another Transfer */}
          <TouchableOpacity
            style={styles.anotherTransferButton}
            onPress={() => {
              router.replace('(transfer)/transfer');
            }}
          >
            <ArrowCounterClockwise
              size={scale(20)}
              color={colors.neutral.neutral2}
              weight="bold"
              style={{ marginRight: spacing(8) }}
            />
            <Text style={styles.anotherTransferText}>Make Another Transfer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing(24),
    paddingTop: spacing(40),
    paddingBottom: spacing(32),
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing(20),
  },
  iconBackground: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: colors.primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.primary1,
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(20),
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing(24),
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: fontSize(24),
    fontWeight: '700',
    lineHeight: fontSize(32),
    color: colors.neutral.neutral1,
    textAlign: 'center',
    marginBottom: spacing(8),
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: fontSize(14),
    fontWeight: '400',
    lineHeight: fontSize(20),
    color: colors.neutral.neutral3,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: colors.neutral.neutral6,
    borderRadius: scale(20),
    padding: spacing(18),
    shadowColor: colors.primary.primary1,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.08,
    shadowRadius: scale(16),
    elevation: 5,
    marginBottom: spacing(20),
    borderWidth: 1,
    borderColor: colors.neutral.neutral5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.neutral5,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontFamily: 'Poppins',
    fontSize: fontSize(13),
    fontWeight: '500',
    lineHeight: fontSize(18),
    color: colors.neutral.neutral3,
  },
  infoValue: {
    fontFamily: 'Poppins',
    fontSize: fontSize(13),
    fontWeight: '600',
    lineHeight: fontSize(18),
    color: colors.neutral.neutral1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing(12),
    marginBottom: spacing(20),
  },
  actionButton: {
    flex: 1,
    height: scale(56),
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: colors.primary.primary4,
    backgroundColor: colors.neutral.neutral6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing(8),
    shadowColor: colors.primary.primary1,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.06,
    shadowRadius: scale(8),
    elevation: 2,
  },
  actionIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors.primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'Poppins',
    fontSize: fontSize(13),
    fontWeight: '600',
    color: colors.primary.primary1,
  },
  buttonsContainer: {
    gap: spacing(12),
  },
  homeButton: {
    height: scale(52),
    shadowColor: colors.primary.primary1,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },
  anotherTransferButton: {
    height: scale(52),
    borderRadius: scale(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.neutral4,
    backgroundColor: colors.neutral.neutral6,
  },
  anotherTransferText: {
    fontFamily: 'Poppins',
    fontSize: fontSize(15),
    fontWeight: '600',
    color: colors.neutral.neutral2,
  },
});

export default TransferSuccess;
