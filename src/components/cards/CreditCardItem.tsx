import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
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
}

const CreditCardItem: React.FC<CreditCardItemProps> = ({
  cardName,
  cardNumber,
  cardType,
  expiryDate,
  cardHolder,
  cardLimit,
  availableCredit,
  containerStyle,
}) => {
  return (
    <View style={[styles.bankCardContainer, containerStyle]}>
      <View style={styles.bankCardGradient}>
        {/* Card Type Badge */}
        <View style={styles.cardTypeBadge}>
          <Text style={styles.cardTypeText}>{cardType}</Text>
        </View>
        
        {/* Card Name */}
        <Text style={styles.cardName}>{cardName}</Text>
        
        {/* Card Number */}
        <Text style={styles.cardNumberLarge}>{cardNumber}</Text>
        
        {/* Card Details Row */}
        <View style={styles.cardDetailsRow}>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>Card Holder</Text>
            <Text style={styles.cardDetailValue}>{cardHolder}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>Expires</Text>
            <Text style={styles.cardDetailValue}>{expiryDate}</Text>
          </View>
        </View>
        
        {/* Card Credit Info */}
        <View style={styles.cardCreditInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Card Limit</Text>
            <Text style={styles.value}>{cardLimit}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Available Credit</Text>
            <Text style={[styles.value, styles.creditValue]}>{availableCredit}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bankCardContainer: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: primary.primary1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  bankCardGradient: {
    backgroundColor: primary.primary1,
    borderRadius: 15,
    padding: 20,
    minHeight: 200,
  },
  cardTypeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cardTypeText: {
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: '600',
    color: neutral.neutral6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardName: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 27,
    color: neutral.neutral6,
    marginBottom: 20,
  },
  cardNumberLarge: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    color: neutral.neutral6,
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardDetailItem: {
    flex: 1,
  },
  cardDetailLabel: {
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardDetailValue: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    color: neutral.neutral6,
  },
  cardCreditInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  value: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: neutral.neutral6,
  },
  creditValue: {
    color: neutral.neutral6,
  },
});

export default CreditCardItem;
