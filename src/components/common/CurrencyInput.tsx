import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';
import { formatCurrencyInput, parseCurrency } from '@/utils/currency';
import { componentSizes, typography, spacingScale, borderRadius } from '@/constants/responsive';
import { spacing, fontSize } from '@/utils/responsive';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string, numericValue: number) => void;
  containerStyle?: any;
  maxAmount?: number;
  currencySymbol?: string;
  showBalance?: boolean;
  availableBalance?: number;
}

/**
 * Currency input component with automatic formatting
 * Formats numbers with thousand separators as user types
 */
const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChangeText,
  containerStyle,
  maxAmount,
  currencySymbol = '$',
  showBalance = false,
  availableBalance,
  placeholder = 'Enter amount',
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    // Format the input
    const formatted = formatCurrencyInput(text);
    const numeric = parseCurrency(formatted);
    
    // Call parent's onChange with formatted text and numeric value
    onChangeText(formatted, numeric);
  };

  const handleQuickAmount = (percentage: number) => {
    if (!availableBalance) return;
    
    const amount = availableBalance * percentage;
    const formatted = formatCurrencyInput(amount.toString());
    const numeric = parseCurrency(formatted);
    
    onChangeText(formatted, numeric);
  };

  const numericValue = parseCurrency(value);
  const hasError = maxAmount && numericValue > maxAmount;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        hasError ? styles.inputWrapperError : null,
      ]}>
        <Text style={styles.currencySymbol}>{currencySymbol}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.neutral4}
          {...textInputProps}
        />
      </View>

      {/* Quick amount buttons */}
      {showBalance && availableBalance !== undefined && availableBalance > 0 ? (
        <View style={styles.quickAmountContainer}>
          <Text style={styles.quickAmountLabel}>Quick select:</Text>
          <View style={styles.quickAmountButtons}>
            {[0.25, 0.5, 0.75, 1].map((percentage, index) => (
              <TouchableOpacity
                key={`quick-${percentage}`}
                onPress={() => handleQuickAmount(percentage)}
                style={[
                  styles.quickAmountButtonWrapper,
                  index < 3 ? { marginRight: spacingScale.sm } : null
                ]}
              >
                <Text style={styles.quickAmountButton}>
                  {percentage === 1 ? 'All' : `${Math.round(percentage * 100)}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {/* Available balance */}
      {showBalance && typeof availableBalance === 'number' ? (
        <Text style={styles.balanceText}>
          {`Available: ${formatCurrencyInput(availableBalance.toString())}${currencySymbol}`}
        </Text>
      ) : null}

      {/* Error message */}
      {hasError ? (
        <Text style={styles.errorText}>
          Amount exceeds available balance
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacingScale.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: componentSizes.inputHeight,
    borderWidth: 1,
    borderColor: colors.neutral.neutral4,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacingScale.md,
    backgroundColor: colors.neutral.neutral6,
  },
  inputWrapperFocused: {
    borderColor: colors.primary.primary1,
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: colors.semantic.error,
  },
  currencySymbol: {
    fontFamily: 'Poppins',
    fontSize: fontSize(16),
    fontWeight: '600',
    color: colors.primary.primary1,
    marginRight: spacingScale.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize(16),
    fontWeight: '600',
    color: colors.neutral.neutral1,
    padding: 0,
  },
  quickAmountContainer: {
    marginTop: spacingScale.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickAmountLabel: {
    fontFamily: 'Poppins',
    fontSize: typography.caption,
    fontWeight: '500',
    color: colors.neutral.neutral3,
  },
  quickAmountButtons: {
    flexDirection: 'row',
  },
  quickAmountButtonWrapper: {
    paddingHorizontal: spacingScale.md,
    paddingVertical: spacing(6),
    backgroundColor: colors.primary.primary4,
    borderRadius: borderRadius.sm,
  },
  quickAmountButton: {
    fontFamily: 'Poppins',
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.primary.primary1,
  },
  balanceText: {
    fontFamily: 'Poppins',
    fontSize: typography.caption,
    fontWeight: '500',
    color: colors.neutral.neutral3,
    marginTop: spacingScale.sm,
  },
  errorText: {
    fontFamily: 'Poppins',
    fontSize: typography.caption,
    fontWeight: '500',
    color: colors.semantic.error,
    marginTop: spacingScale.sm,
  },
});

export default CurrencyInput;
