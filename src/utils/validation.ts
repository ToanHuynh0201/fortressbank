/**
 * Form validation rules and utilities
 */

export type ValidationRule = (value: any) => string | undefined;

/**
 * Validation rules
 */
export const validationRules = {
  required: (fieldName: string): ValidationRule => 
    (value) => !value ? `${fieldName} is required` : undefined,

  minLength: (min: number, fieldName: string): ValidationRule => 
    (value) => value && value.length < min 
      ? `${fieldName} must be at least ${min} characters` 
      : undefined,

  maxLength: (max: number, fieldName: string): ValidationRule => 
    (value) => value && value.length > max 
      ? `${fieldName} must be less than ${max} characters` 
      : undefined,

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? 'Invalid email address' : undefined;
  },

  phoneNumber: (value: string) => {
    const phoneRegex = /^[0-9]{9,15}$/;
    return value && !phoneRegex.test(value.replace(/\s/g, '')) 
      ? 'Invalid phone number' 
      : undefined;
  },

  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain a number';
    return undefined;
  },

  confirmPassword: (password: string): ValidationRule => 
    (value) => value !== password ? 'Passwords do not match' : undefined,

  cardNumber: (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const cardRegex = /^[0-9]{13,19}$/;
    return cleaned && !cardRegex.test(cleaned) 
      ? 'Invalid card number' 
      : undefined;
  },

  amount: (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Amount must be greater than 0';
    }
    return undefined;
  },
};

/**
 * Compose multiple validation rules
 */
export const composeValidators = (...validators: ValidationRule[]): ValidationRule => 
  (value) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };

/**
 * Validate entire form
 */
export const validateForm = <T extends Record<string, any>>(
  values: T,
  validationSchema: Partial<Record<keyof T, ValidationRule>>
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};
  
  Object.keys(validationSchema).forEach((key) => {
    const validator = validationSchema[key as keyof T];
    if (validator) {
      const error = validator(values[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
      }
    }
  });
  
  return errors;
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : cleaned;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    return [match[1], match[2], match[3]].filter(Boolean).join(' ');
  }
  return cleaned;
};
