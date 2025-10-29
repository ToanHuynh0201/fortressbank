import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { neutral, primary } from '@/constants/colors';
import InfoRow from '../common/InfoRow';

interface AccountCardItemProps {
  accountName: string;
  accountNumber: string;
  balance: string;
  branch: string;
  containerStyle?: ViewStyle;
}

const AccountCardItem: React.FC<AccountCardItemProps> = ({
  accountName,
  accountNumber,
  balance,
  branch,
  containerStyle,
}) => {
  return (
    <View style={[styles.cardContainer, containerStyle]}>
      <View style={styles.cardHeader}>
        <Text style={styles.accountName}>{accountName}</Text>
        <Text style={styles.accountNumber}>{accountNumber}</Text>
      </View>
      <View style={styles.cardFooter}>
        <InfoRow label="Avalable balance" value={balance} />
        <InfoRow label="Branch" value={branch} containerStyle={styles.infoRowSpacing} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: neutral.neutral6,
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: primary.primary1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountName: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: neutral.neutral1,
  },
  accountNumber: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: neutral.neutral1,
  },
  cardFooter: {
    gap: 8,
  },
  infoRowSpacing: {
    marginTop: 8,
  },
});

export default AccountCardItem;
