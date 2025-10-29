import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { neutral, primary } from '@/constants/colors';

interface BankCardProps {
  cardholderName: string;
  cardNumber: string;
  balance: string;
  containerStyle?: ViewStyle;
  showDots?: boolean;
}

const BankCard: React.FC<BankCardProps> = ({
  cardholderName,
  cardNumber,
  balance,
  containerStyle,
  showDots = true,
}) => {
  const renderCardNumber = () => {
    if (!showDots) {
      return <Text style={styles.cardNumberText}>{cardNumber}</Text>;
    }

    // Format: •••• 4756 •••• 9018
    const parts = cardNumber.split(' ');
    
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{cardholderName}</Text>
        </View>
        {renderCardNumber()}
        <Text style={styles.cardBalance}>{balance}</Text>
      </View>
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
    backgroundColor: '#1E1671',
    borderRadius: 10,
    padding: 20,
    shadowColor: 'rgba(54, 41, 183, 0.07)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 30,
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: '400',
    color: neutral.neutral6,
    lineHeight: 36,
    marginBottom: 4,
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
    width: 6,
    height: 6,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2.5,
  },
  cardNumberText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '400',
    color: neutral.neutral6,
    lineHeight: 24,
  },
  cardBalance: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    lineHeight: 28,
  },
});

export default BankCard;
