import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { CaretLeft, Eye, EyeSlash } from 'phosphor-react-native';
import colors from '@/constants/colors';
import { ScreenContainer, PrimaryButton, CheckboxWithLabel, CustomInput } from '@/components';
import { useForm } from '@/hooks';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface TransferOption {
  id: string;
  title: string;
  icon: string;
}

interface Beneficiary {
  id: string;
  name: string;
  avatar: string;
}

interface Account {
  id: string;
  label: string;
  fullNumber: string;
  maskedNumber: string;
  balance: string;
}

const Transfer = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('card');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);
  
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(15);

  useEffect(() => {
    headerOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    
    contentOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    contentTranslateY.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));
  
  // Form fields managed by useForm hook
  const { values, handleChange, setFieldValue } = useForm({
    name: '',
    cardNumber: '',
    amount: '',
    content: '',
    saveToBeneficiary: false,
  });

  const transferOptions: TransferOption[] = [
    { id: 'card', title: 'Transfer via\ncard number', icon: '💳' },
    { id: 'same_bank', title: 'Transfer to\nthe same bank', icon: '🏦' },
    { id: 'other_bank', title: 'Transfer to\nanother bank', icon: '🔄' },
  ];

  const beneficiaries: Beneficiary[] = [
    { id: '1', name: 'Emma', avatar: '👩' },
    { id: '2', name: 'Justin', avatar: '👨' },
    { id: '3', name: 'Amanda', avatar: '👩' },
  ];

  const accounts: Account[] = [
    { 
      id: '1', 
      label: 'VISA', 
      fullNumber: '4532 1234 5678 1234',
      maskedNumber: '**** **** **** 1234',
      balance: '10,000$' 
    },
    { 
      id: '2', 
      label: 'Account', 
      fullNumber: '1234 5678 5689',
      maskedNumber: '**** **** 5689',
      balance: '10,000$' 
    },
    { 
      id: '3', 
      label: 'MasterCard', 
      fullNumber: '5412 3456 7890 8765',
      maskedNumber: '**** **** **** 8765',
      balance: '5,500$' 
    },
    { 
      id: '4', 
      label: 'Savings Account', 
      fullNumber: '9876 5432 1098',
      maskedNumber: '**** **** 1098',
      balance: '25,000$' 
    },
  ];

  const isFormValid = values.name && values.cardNumber && values.amount && values.content;

  return (
    <ScreenContainer backgroundColor={colors.neutral.neutral6}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Navigation Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <CaretLeft size={16} color={colors.neutral.neutral1} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer</Text>
      </Animated.View>

      {/* Content */}
      <AnimatedScrollView
        style={[styles.scrollView, contentAnimatedStyle]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Selection */}
        <Animated.View 
          entering={FadeIn.delay(100).duration(400)}
          style={styles.section}
        >
          <View style={styles.accountSelectorWrapper}>
            <TouchableOpacity 
              style={styles.accountSelector}
              onPress={() => setShowAccountDropdown(!showAccountDropdown)}
            >
              <View style={styles.accountSelectorContent}>
                <View style={styles.accountTextContainer}>
                  {selectedAccount ? (
                    <>
                      <Text style={styles.accountLabelSelected}>
                        {accounts.find(a => a.id === selectedAccount)?.label}{' '}
                        {showAccountNumbers 
                          ? accounts.find(a => a.id === selectedAccount)?.fullNumber
                          : accounts.find(a => a.id === selectedAccount)?.maskedNumber
                        }
                      </Text>
                      <Text style={styles.balanceLabel}>
                        Available balance : {accounts.find(a => a.id === selectedAccount)?.balance}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.accountLabel}>Choose account / card</Text>
                  )}
                </View>
                <View style={styles.accountSelectorIcons}>
                  {selectedAccount && (
                    <TouchableOpacity 
                      onPress={() => setShowAccountNumbers(!showAccountNumbers)}
                      style={styles.eyeButton}
                    >
                      {showAccountNumbers ? (
                        <Eye size={20} color={colors.primary.primary1} weight="regular" />
                      ) : (
                        <EyeSlash size={20} color={colors.neutral.neutral3} weight="regular" />
                      )}
                    </TouchableOpacity>
                  )}
                  <Text style={styles.dropdownIcon}>▼</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Dropdown Menu */}
          {showAccountDropdown && (
            <View style={styles.dropdownMenu}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.dropdownItem,
                    selectedAccount === account.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedAccount(account.id);
                    setShowAccountDropdown(false);
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.cardIconText}>💳</Text>
                    </View>
                    <View style={styles.dropdownItemInfo}>
                      <Text style={styles.dropdownItemLabel}>
                        {account.label}{' '}
                        {showAccountNumbers ? account.fullNumber : account.maskedNumber}
                      </Text>
                      <Text style={styles.dropdownItemBalance}>
                        Available balance: {account.balance}
                      </Text>
                    </View>
                    {selectedAccount === account.id && (
                      <View style={styles.checkIcon}>
                        <Text style={styles.checkIconText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* Toggle Eye in Dropdown */}
              <TouchableOpacity 
                style={styles.dropdownEyeToggle}
                onPress={() => setShowAccountNumbers(!showAccountNumbers)}
              >
                {showAccountNumbers ? (
                  <Eye size={20} color={colors.primary.primary1} weight="regular" />
                ) : (
                  <EyeSlash size={20} color={colors.neutral.neutral3} weight="regular" />
                )}
                <Text style={styles.dropdownEyeText}>
                  {showAccountNumbers ? 'Hide account numbers' : 'Show account numbers'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Choose Transaction */}
        <Animated.View 
          entering={FadeIn.delay(150).duration(400)}
          style={styles.section}
        >
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
        </Animated.View>

        {/* Choose Beneficiary */}
        <Animated.View 
          entering={FadeIn.delay(200).duration(400)}
          style={styles.section}
        >
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
        </Animated.View>

        {/* Transfer Form */}
        <Animated.View 
          entering={FadeIn.delay(250).duration(400)}
          style={styles.formCard}
        >
          <CustomInput
            placeholder="Name"
            value={values.name}
            onChangeText={(text) => handleChange('name', text)}
            containerStyle={styles.input}
          />

          <CustomInput
            placeholder="Card number"
            value={values.cardNumber}
            onChangeText={(text) => handleChange('cardNumber', text)}
            keyboardType="numeric"
            containerStyle={styles.input}
          />

          <CustomInput
            placeholder="Amount"
            value={values.amount}
            onChangeText={(text) => handleChange('amount', text)}
            keyboardType="numeric"
            containerStyle={styles.input}
          />

          <CustomInput
            placeholder="Content"
            value={values.content}
            onChangeText={(text) => handleChange('content', text)}
            containerStyle={styles.input}
          />

          {/* Checkbox */}
          <View style={styles.checkboxContainer}>
            <CheckboxWithLabel
              checked={values.saveToBeneficiary}
              onPress={() => setFieldValue('saveToBeneficiary', !values.saveToBeneficiary)}
              label="Save to directory of beneficiary"
              labelStyle={styles.checkboxLabel}
            />
          </View>

          {/* Confirm Button */}
          <PrimaryButton
            title="Confirm"
            onPress={() => {
              router.push('(transfer)/transferConfirmation');
            }}
            disabled={!isFormValid}
            style={styles.confirmButton}
          />
        </Animated.View>
      </AnimatedScrollView>

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
  accountSelectorWrapper: {
    position: 'relative',
  },
  accountSelector: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.neutral.neutral4,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.neutral.neutral6,
  },
  accountSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  accountSelectorIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeButton: {
    padding: 4,
  },
  accountLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.neutral4,
  },
  accountLabelSelected: {
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
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.neutral.neutral5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.neutral5,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary.primary4,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.primary4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 20,
  },
  dropdownItemInfo: {
    flex: 1,
  },
  dropdownItemLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.neutral1,
    marginBottom: 4,
  },
  dropdownItemBalance: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '400',
    color: colors.neutral.neutral3,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.primary1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    fontSize: 16,
    color: colors.neutral.neutral6,
    fontWeight: 'bold',
  },
  dropdownEyeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: colors.neutral.neutral6,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.neutral5,
  },
  dropdownEyeText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral.neutral1,
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
    marginBottom: 24,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkboxLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: '#979797',
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

export default Transfer;
