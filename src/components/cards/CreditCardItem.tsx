import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Sparkle } from 'phosphor-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { neutral, primary } from '@/constants/colors';

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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bankCardGradient: {
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -30,
    left: -30,
  },
  chipContainer: {
    marginBottom: 24,
    zIndex: 1,
  },
  chip: {
    width: 48,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInner: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardNumberLarge: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: neutral.neutral6,
    letterSpacing: 2.5,
    marginBottom: 24,
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
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDetailValue: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    color: neutral.neutral6,
  },
  cardLogoContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogoCircle1: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: -10,
  },
  cardLogoCircle2: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default CreditCardItem;
