import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Sparkle } from 'phosphor-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { neutral, primary } from '@/constants/colors';
import { scale } from '@/utils/responsive';
import { typography, spacingScale, borderRadius } from '@/constants/responsive';

interface CreditCardItemProps {
  cardName: string;
  cardNumber: string;
  cardType: 'Visa' | 'Mastercard' | 'American Express';
  expiryDate: string;
  cardHolder: string;
  cardLimit: string;
  availableCredit: string;
  containerStyle?: ViewStyle;
  onPress?: () => void;
}

const getCardGradient = (cardType: string) => {
  switch (cardType) {
    case 'Visa':
      return ['#1E3A8A', '#3B82F6', '#60A5FA'];
    case 'Mastercard':
      return ['#DC2626', '#EF4444', '#F87171'];
    case 'American Express':
      return ['#059669', '#10B981', '#34D399'];
    default:
      return ['#4A3FDB', '#6B5FE8', '#8B7FF5'];
  }
};

const CreditCardItem: React.FC<CreditCardItemProps> = ({
  cardName,
  cardNumber,
  cardType,
  expiryDate,
  cardHolder,
  cardLimit,
  availableCredit,
  containerStyle,
  onPress,
}) => {
  const CardContent = () => (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={[styles.bankCardContainer, containerStyle]}
    >
      <LinearGradient
        colors={['#4A3FDB', '#6B5FE8', '#8B7FF5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bankCardGradient}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Chip Design */}
        <View style={styles.chipContainer}>
          <View style={styles.chip}>
            <View style={styles.chipInner} />
          </View>
        </View>

        {/* Card Number */}
        <Text style={styles.cardNumberLarge}>{cardNumber}</Text>

        {/* Card Details Row */}
        <View style={styles.cardDetailsRow}>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>CARD HOLDER</Text>
            <Text style={styles.cardDetailValue}>{cardHolder}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>EXPIRES</Text>
            <Text style={styles.cardDetailValue}>{expiryDate}</Text>
          </View>
        </View>

        {/* Card Network Logo */}
        <View style={styles.cardLogoContainer}>
          <View style={styles.cardLogoCircle1} />
          <View style={styles.cardLogoCircle2} />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  bankCardContainer: {
    borderRadius: borderRadius.lg,
    marginBottom: spacingScale.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(8),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(16),
    elevation: 8,
  },
  bankCardGradient: {
    borderRadius: borderRadius.lg,
    padding: spacingScale.lg,
    minHeight: scale(200),
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: scale(-50),
    right: scale(-40),
  },
  decorativeCircle2: {
    position: 'absolute',
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: scale(-30),
    left: scale(-30),
  },
  chipContainer: {
    marginBottom: spacingScale.xl,
    zIndex: 1,
  },
  chip: {
    width: scale(48),
    height: scale(36),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
    padding: spacingScale.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInner: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xs,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardNumberLarge: {
    fontFamily: 'Poppins',
    fontSize: typography.h3,
    fontWeight: '700',
    lineHeight: scale(28),
    color: neutral.neutral6,
    letterSpacing: 2.5,
    marginBottom: spacingScale.xl,
    zIndex: 1,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  cardDetailItem: {
    flex: 1,
  },
  cardDetailLabel: {
    fontFamily: 'Poppins',
    fontSize: typography.tiny,
    fontWeight: '600',
    lineHeight: scale(12),
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    marginBottom: spacingScale.xs,
    letterSpacing: 0.5,
  },
  cardDetailValue: {
    fontFamily: 'Poppins',
    fontSize: typography.bodySmall,
    fontWeight: '700',
    lineHeight: scale(20),
    color: neutral.neutral6,
  },
  cardLogoContainer: {
    position: 'absolute',
    bottom: spacingScale.lg,
    right: spacingScale.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogoCircle1: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: scale(-10),
  },
  cardLogoCircle2: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default CreditCardItem;
