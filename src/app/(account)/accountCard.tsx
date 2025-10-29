import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import colors from '@/constants/colors';
import {
  ScreenContainer,
  UserAvatar,
  AccountCardItem,
  CreditCardItem,
} from '@/components';

interface AccountCardData {
  id: string;
  accountName: string;
  accountNumber: string;
  balance: string;
  branch: string;
}

interface BankCardData {
  id: string;
  cardName: string;
  cardNumber: string;
  cardType: 'Visa' | 'Mastercard' | 'American Express';
  expiryDate: string;
  cvv: string;
  cardHolder: string;
  cardLimit: string;
  availableCredit: string;
}

const accountsData: AccountCardData[] = [
  {
    id: '1',
    accountName: 'Account 1',
    accountNumber: '1900 8988 1234',
    balance: '$20,000',
    branch: 'New York',
  },
  {
    id: '2',
    accountName: 'Account 2',
    accountNumber: '8988 1234',
    balance: '$12,000',
    branch: 'New York',
  },
  {
    id: '3',
    accountName: 'Account 3',
    accountNumber: '1900 1234 2222',
    balance: '$230,000',
    branch: 'New York',
  },
];

const cardsData: BankCardData[] = [
  {
    id: '1',
    cardName: 'Platinum Visa',
    cardNumber: '4532 **** **** 8765',
    cardType: 'Visa',
    expiryDate: '12/26',
    cvv: '***',
    cardHolder: 'Push Puttichai',
    cardLimit: '$50,000',
    availableCredit: '$35,000',
  },
  {
    id: '2',
    cardName: 'Gold Mastercard',
    cardNumber: '5425 **** **** 3210',
    cardType: 'Mastercard',
    expiryDate: '08/27',
    cvv: '***',
    cardHolder: 'Push Puttichai',
    cardLimit: '$30,000',
    availableCredit: '$28,500',
  },
  {
    id: '3',
    cardName: 'Business Amex',
    cardNumber: '3782 **** **** 9876',
    cardType: 'American Express',
    expiryDate: '03/28',
    cvv: '****',
    cardHolder: 'Push Puttichai',
    cardLimit: '$100,000',
    availableCredit: '$85,000',
  },
];

const AccountCard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'card'>('account');

  const renderAccountCard = (account: AccountCardData) => (
    <AccountCardItem
      key={account.id}
      accountName={account.accountName}
      accountNumber={account.accountNumber}
      balance={account.balance}
      branch={account.branch}
    />
  );

  const renderBankCard = (card: BankCardData) => (
    <CreditCardItem
      key={card.id}
      cardName={card.cardName}
      cardNumber={card.cardNumber}
      cardType={card.cardType}
      expiryDate={card.expiryDate}
      cardHolder={card.cardHolder}
      cardLimit={card.cardLimit}
      availableCredit={card.availableCredit}
    />
  );

  return (
    <ScreenContainer backgroundColor={colors.neutral.neutral6}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <CaretLeft size={16} color={colors.neutral.neutral1} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account and card</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'account' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('account')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'account' && styles.tabTextActive,
            ]}
          >
            Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'card' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('card')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'card' && styles.tabTextActive,
            ]}
          >
            Card
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Avatar and Name */}
      <View style={styles.userSection}>
        <UserAvatar
          initials="PP"
          size={100}
          backgroundColor={colors.primary.primary1}
          textColor={colors.neutral.neutral6}
        />
        <Text style={styles.userName}>Push Puttichai</Text>
      </View>

      {/* Account Cards List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'account' ? (
          accountsData.map((account) => renderAccountCard(account))
        ) : (
          cardsData.map((card) => renderBankCard(card))
        )}
      </ScrollView>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    height: 53,
  },
  backButton: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.neutral.neutral1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primary.primary4,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tabActive: {
    backgroundColor: colors.primary.primary1,
  },
  tabText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: colors.neutral.neutral1,
  },
  tabTextActive: {
    color: colors.neutral.neutral6,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  userName: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.primary.primary1,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 50,
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

export default AccountCard;
