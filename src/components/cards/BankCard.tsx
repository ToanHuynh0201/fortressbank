import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Eye, EyeSlash, CreditCard } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { neutral, primary } from '@/constants/colors';

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
    height: 221,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: 204,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1E1671',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  // Decorative elements
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -80,
    right: -60,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -40,
    left: -40,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: 60,
    left: -30,
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chipContainer: {
    width: 50,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 8,
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
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: 4,
    left: 2,
  },
  chipLine2: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    bottom: 4,
    left: 0,
  },
  bankName: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eyeButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  cardMiddle: {
    marginBottom: 20,
  },
  cardNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dotsGroup: {
    flexDirection: 'row',
    marginHorizontal: 4,
  },
  dot: {
    width: 7,
    height: 7,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 3.5,
  },
  cardNumberText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    lineHeight: 24,
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
    fontSize: 10,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  cardBalance: {
    fontSize: 22,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: neutral.neutral6,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  cardLogo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 0,
  },
});

export default BankCard;
