import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Eye, EyeSlash, CreditCard } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { neutral, primary } from '@/constants/colors';
import { scale } from '@/utils/responsive';
import { typography, spacingScale, borderRadius } from '@/constants/responsive';

interface BankCardProps {
  cardholderName: string;
  cardNumber: string;
  maskedCardNumber?: string;
  balance: string;
  containerStyle?: ViewStyle;
  showDots?: boolean;
}

const BankCard: React.FC<BankCardProps> = ({
  cardholderName,
  cardNumber,
  maskedCardNumber,
  balance,
  containerStyle,
  showDots = true,
}) => {
  const [showFullNumber, setShowFullNumber] = useState(false);

  const displayNumber = showFullNumber ? cardNumber : (maskedCardNumber || cardNumber);
  const displayBalance = showFullNumber ? balance : '$ •••••';

  const renderCardNumber = () => {
    if (!showDots) {
      return <Text style={styles.cardNumberText}>{displayNumber}</Text>;
    }

    // Format: •••• 4756 •••• 9018
    const parts = displayNumber.split(' ');
    
    return (
      <View style={styles.cardNumber}>
        {parts.map((part, index) => {
          if (part.includes('*') || part.includes('•')) {
            return (
              <View key={index} style={styles.dotsGroup}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            );
          }
          return <Text key={index} style={styles.cardNumberText}> {part} </Text>;
        })}
      </View>
    );
  };

  return (
    <View style={[styles.cardBackground, containerStyle]}>
      <LinearGradient
        colors={['#4A3FDB', '#1E1671', '#0D0942']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        
        {/* Card content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.chipContainer}>
                <View style={styles.chip}>
                  <View style={styles.chipLine1} />
                  <View style={styles.chipLine2} />
                </View>
              </View>
              <Text style={styles.bankName}>FortressBank</Text>
            </View>
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowFullNumber(!showFullNumber)}
            >
              {showFullNumber ? (
                <Eye size={24} color={neutral.neutral6} weight="bold" />
              ) : (
                <EyeSlash size={24} color="rgba(255, 255, 255, 0.8)" weight="bold" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.cardMiddle}>
            {renderCardNumber()}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardholderSection}>
              <Text style={styles.cardLabel}>CARDHOLDER</Text>
              <Text style={styles.cardName}>{cardholderName}</Text>
            </View>
            <View style={styles.balanceSection}>
              <Text style={styles.cardLabel}>BALANCE</Text>
              <Text style={styles.cardBalance}>{displayBalance}</Text>
            </View>
          </View>
        </View>

        {/* Card network logo placeholder */}
        <View style={styles.cardLogo}>
          <CreditCard size={40} color="rgba(255, 255, 255, 0.3)" weight="fill" />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBackground: {
    width: '100%',
    height: scale(221),
    position: 'relative',
  },
  card: {
    width: '100%',
    height: scale(204),
    borderRadius: borderRadius.xl,
    padding: spacingScale.xl,
    shadowColor: '#1E1671',
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.3,
    shadowRadius: scale(16),
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  // Decorative elements
  decorativeCircle1: {
    position: 'absolute',
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: scale(-80),
    right: scale(-60),
  },
  decorativeCircle2: {
    position: 'absolute',
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: scale(-40),
    left: scale(-40),
  },
  decorativeCircle3: {
    position: 'absolute',
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: scale(60),
    left: scale(-30),
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingScale.xl,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.md,
  },
  chipContainer: {
    width: scale(50),
    height: scale(38),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.sm,
    padding: spacingScale.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  chipLine1: {
    position: 'absolute',
    width: '70%',
    height: scale(2),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: scale(4),
    left: scale(2),
  },
  chipLine2: {
    position: 'absolute',
    width: '100%',
    height: scale(2),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    bottom: scale(4),
    left: 0,
  },
  bankName: {
    fontSize: typography.bodySmall,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eyeButton: {
    padding: spacingScale.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.sm,
  },
  cardMiddle: {
    marginBottom: spacingScale.lg,
  },
  cardNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacingScale.xs,
  },
  dotsGroup: {
    flexDirection: 'row',
    marginHorizontal: spacingScale.xs,
  },
  dot: {
    width: scale(7),
    height: scale(7),
    marginHorizontal: scale(2),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: scale(3.5),
  },
  cardNumberText: {
    fontSize: typography.subtitle,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    lineHeight: scale(24),
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardholderSection: {
    flex: 1,
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: typography.tiny,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: spacingScale.xs,
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: typography.body,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    lineHeight: scale(24),
    textTransform: 'uppercase',
  },
  cardBalance: {
    fontSize: typography.h3,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: neutral.neutral6,
    lineHeight: scale(28),
    letterSpacing: 0.5,
  },
  cardLogo: {
    position: 'absolute',
    bottom: spacingScale.lg,
    right: spacingScale.lg,
    zIndex: 0,
  },
});

export default BankCard;
