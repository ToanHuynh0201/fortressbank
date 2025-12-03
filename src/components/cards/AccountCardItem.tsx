import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bank } from 'phosphor-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { neutral, primary } from '@/constants/colors';

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
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={[styles.cardWrapper, containerStyle]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardContainer}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Card Header with Icon */}
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Bank size={24} color={primary.primary1} weight="duotone" />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.accountName}>{accountName}</Text>
            <Text style={styles.accountNumber}>{accountNumber}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{balance}</Text>
        </View>

        {/* Bottom Accent */}
        <View style={styles.bottomAccent} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: neutral.neutral6,
    borderRadius: 20,
    padding: 20,
    shadowColor: primary.primary1,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(74, 63, 219, 0.08)',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 63, 219, 0.03)',
    top: -40,
    right: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 63, 219, 0.02)',
    bottom: -20,
    left: -20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 63, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  accountName: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: neutral.neutral1,
    marginBottom: 2,
  },
  accountNumber: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: primary.primary2,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(74, 63, 219, 0.1)',
    marginVertical: 16,
    zIndex: 1,
  },
  balanceSection: {
    zIndex: 1,
  },
  balanceLabel: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#979797',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontFamily: 'Poppins',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: primary.primary1,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: primary.primary1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default AccountCardItem;
