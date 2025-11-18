/**
 * Currency utility functions
 */

/**
 * Format number to currency string
 * @param {number | string} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount: number | string, currency = '$'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  
  if (isNaN(numAmount)) return `0${currency}`;
  
  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + currency;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format input as currency while typing
 * @param {string} value - Current input value
 * @returns {string} Formatted value
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Format the integer part with thousand separators
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Combine with decimal part if exists
  if (parts.length === 2) {
    return integerPart + '.' + parts[1].slice(0, 2); // Limit to 2 decimal places
  }
  
  return integerPart;
};

/**
 * Validate amount is within range
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @returns {string | undefined} Error message or undefined
 */
export const validateAmount = (
  amount: number,
  min: number = 0,
  max?: number
): string | undefined => {
  if (isNaN(amount)) {
    return 'Invalid amount';
  }
  
  if (amount <= min) {
    return `Amount must be greater than ${formatCurrency(min)}`;
  }
  
  if (max && amount > max) {
    return `Amount cannot exceed ${formatCurrency(max)}`;
  }
  
  return undefined;
};
