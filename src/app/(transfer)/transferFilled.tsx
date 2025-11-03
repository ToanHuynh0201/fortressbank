import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import colors from '@/constants/colors';
import { ScreenContainer, PrimaryButton, CheckboxWithLabel } from '@/components';

const TransferFilled = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('card');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('1');
  
  // Form fields - pre-filled
  const [name, setName] = useState('Capi Creative Design');
  const [cardNumber, setCardNumber] = useState('0123456789109');
  const [amount, setAmount] = useState('$1000');
  const [content, setContent] = useState('$1000');
  const [saveToBeneficiary, setSaveToBeneficiary] = useState(true);

  const transferOptions = [
    { id: 'card', title: 'Transfer via\ncard number', icon: '💳' },
    { id: 'same_bank', title: 'Transfer to\nthe same bank', icon: '🏦' },
    { id: 'other_bank', title: 'Transfer to\nanother bank', icon: '🔄' },
  ];

  const beneficiaries = [
    { id: '1', name: 'Emma', avatar: '👩' },
    { id: '2', name: 'Justin', avatar: '👨' },
    { id: '3', name: 'Amanda', avatar: '👩' },
  ];

  const amountInWords = 'One thousand dollar';

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
        <Text style={styles.headerTitle}>Transfer</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Selection */}
        <View style={styles.section}>
          <View style={styles.accountSelector}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>VISA **** **** **** 1234</Text>
              <Text style={styles.balanceLabel}>Available balance : 10,000$</Text>
            </View>
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </View>

        {/* Choose Transaction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose transaction</Text>
          <View style={styles.optionsGrid}>
            {transferOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedOption === option.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedOption(option.id)}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.optionTitle,
                  selectedOption === option.id && styles.optionTitleSelected,
                ]}>
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Choose Beneficiary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose beneficiary</Text>
            <TouchableOpacity>
              <Text style={styles.findLink}>Find beneficiary</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.beneficiariesScroll}
          >
            {/* Add New Button */}
            <TouchableOpacity style={styles.beneficiaryCard}>
              <View style={styles.addBeneficiaryCircle}>
                <Text style={styles.addBeneficiaryIcon}>+</Text>
              </View>
            </TouchableOpacity>

            {/* Beneficiaries */}
            {beneficiaries.map((beneficiary) => (
              <TouchableOpacity
                key={beneficiary.id}
                style={[
                  styles.beneficiaryCard,
                  selectedBeneficiary === beneficiary.id && styles.beneficiaryCardSelected,
                ]}
                onPress={() => setSelectedBeneficiary(beneficiary.id)}
              >
                <View style={[
                  styles.beneficiaryAvatar,
                  selectedBeneficiary === beneficiary.id && styles.beneficiaryAvatarSelected,
                ]}>
                  <Text style={styles.beneficiaryAvatarText}>{beneficiary.avatar}</Text>
                </View>
                <Text style={[
                  styles.beneficiaryName,
                  selectedBeneficiary === beneficiary.id && styles.beneficiaryNameSelected,
                ]}>
                  {beneficiary.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {selectedBeneficiary && (
            <Text style={styles.selectedBeneficiaryName}>
              {beneficiaries.find(b => b.id === selectedBeneficiary)?.name}
            </Text>
          )}
        </View>

        {/* Transfer Form */}
        <View style={styles.formCard}>
          <TextInput
            style={[styles.input, styles.inputActive]}
            placeholder="Name"
            placeholderTextColor={colors.neutral.neutral4}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, styles.inputActive]}
            placeholder="Card number"
            placeholderTextColor={colors.neutral.neutral4}
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, styles.inputActive]}
            placeholder="Amount"
            placeholderTextColor={colors.neutral.neutral4}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          
          {/* Amount in words */}
          {amount && (
            <Text style={styles.amountInWords}>{amountInWords}</Text>
          )}

          <TextInput
            style={[styles.input, styles.inputActive]}
            placeholder="Content"
            placeholderTextColor={colors.neutral.neutral4}
            value={content}
            onChangeText={setContent}
          />

          {/* Checkbox */}
          <View style={styles.checkboxContainer}>
            <CheckboxWithLabel
              checked={saveToBeneficiary}
              onPress={() => setSaveToBeneficiary(!saveToBeneficiary)}
              label="Save to directory of beneficiary"
              labelStyle={styles.checkboxLabel}
            />
          </View>

          {/* Confirm Button */}
          <PrimaryButton
            title="Confirm"
            onPress={() => {
              console.log('Transfer confirmed');
              router.push('(transfer)/transferConfirmation');
            }}
            disabled={false}
            style={styles.confirmButton}
          />
        </View>
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
    backgroundColor: colors.neutral.neutral6,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.neutral.neutral3,
  },
  findLink: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.primary.primary1,
  },
  accountSelector: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.neutral.neutral4,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.neutral6,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.neutral1,
  },
  balanceLabel: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.primary1,
    marginTop: 4,
  },
  dropdownIcon: {
    fontSize: 12,
    color: colors.neutral.neutral4,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  optionCard: {
    flex: 1,
    height: 100,
    backgroundColor: colors.neutral.neutral5,
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 3,
  },
  optionCardSelected: {
    backgroundColor: colors.primary.primary1,
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  optionTitle: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.neutral.neutral6,
  },
  optionTitleSelected: {
    color: colors.neutral.neutral6,
  },
  beneficiariesScroll: {
    marginTop: 12,
  },
  beneficiaryCard: {
    width: 100,
    height: 120,
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 15,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 3,
  },
  beneficiaryCardSelected: {
    backgroundColor: colors.primary.primary1,
  },
  addBeneficiaryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addBeneficiaryIcon: {
    fontSize: 32,
    color: colors.primary.primary1,
  },
  beneficiaryAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  beneficiaryAvatarSelected: {
    backgroundColor: colors.neutral.neutral6,
  },
  beneficiaryAvatarText: {
    fontSize: 32,
  },
  beneficiaryName: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.neutral1,
  },
  beneficiaryNameSelected: {
    color: colors.neutral.neutral6,
  },
  selectedBeneficiaryName: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary.primary1,
    marginTop: 8,
    textAlign: 'right',
  },
  formCard: {
    marginHorizontal: 24,
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 15,
    padding: 16,
    shadowColor: 'rgba(54, 41, 183, 0.07)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 5,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.neutral.neutral4,
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 24,
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.neutral1,
  },
  inputActive: {
    borderColor: colors.neutral.neutral1,
  },
  amountInWords: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.primary1,
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 12,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkboxLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.neutral1,
  },
  confirmButton: {
    marginTop: 8,
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

export default TransferFilled;
