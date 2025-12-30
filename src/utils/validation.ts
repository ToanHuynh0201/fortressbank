/**
 * Form validation rules and utilities
 */

export type ValidationRule = (value: any) => string | undefined;

/**
 * Validation rules
 */
export const validationRules = {
	required:
		(fieldName: string): ValidationRule =>
		(value) =>
			!value ? `${fieldName} is required` : undefined,

	minLength:
		(min: number, fieldName: string): ValidationRule =>
		(value) =>
			value && value.length < min
				? `${fieldName} must be at least ${min} characters`
				: undefined,

	maxLength:
		(max: number, fieldName: string): ValidationRule =>
		(value) =>
			value && value.length > max
				? `${fieldName} must be less than ${max} characters`
				: undefined,

	email: (value: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return value && !emailRegex.test(value)
			? "Invalid email address"
			: undefined;
	},

	username: (value: string) => {
		if (!value) return "Username is required";
		if (value.length < 4) return "Username must be at least 4 characters";
		if (value.length > 30)
			return "Username must be less than 30 characters";
		if (!/^[a-zA-Z0-9_]+$/.test(value))
			return "Username can only contain letters, numbers, and underscores";
		return undefined;
	},

	fullName: (value: string) => {
		if (!value) return "Full name is required";
		if (value.trim().length < 2)
			return "Full name must be at least 2 characters";
		if (!/^[a-zA-Z\s]+$/.test(value))
			return "Full name can only contain letters and spaces";
		return undefined;
	},

	phoneNumber: (value: string) => {
		const phoneRegex = /^[0-9]{10,11}$/;
		return value && !phoneRegex.test(value.replace(/\s/g, ""))
			? "Phone number must be 10-11 digits"
			: undefined;
	},

	password: (value: string) => {
		if (!value) return "Password is required";
		if (value.length < 8) return "Password must be at least 8 characters";
		if (!/[A-Z]/.test(value))
			return "Password must contain an uppercase letter";
		if (!/[a-z]/.test(value))
			return "Password must contain a lowercase letter";
		if (!/[0-9]/.test(value)) return "Password must contain a number";
		if (!/[@$!%*?&#]/.test(value))
			return "Password must contain a special character (@$!%*?&#)";
		return undefined;
	},

	confirmPassword:
		(password: string): ValidationRule =>
		(value) =>
			value !== password ? "Passwords do not match" : undefined,

	pin: (value: string) => {
		if (!value) return "PIN is required";
		if (!/^\d{6}$/.test(value)) return "PIN must be 6 digits";
		return undefined;
	},

	confirmPIN:
		(pin: string): ValidationRule =>
		(value) =>
			value !== pin ? "PINs do not match" : undefined,

	citizenId: (value: string) => {
		if (!value) return "Citizen ID is required";
		if (!/^\d{12}$/.test(value)) return "Citizen ID must be 12 digits";
		return undefined;
	},

	cardNumber: (value: string) => {
		const cleaned = value.replace(/\s/g, "");
		const cardRegex = /^[0-9]{13,19}$/;
		return cleaned && !cardRegex.test(cleaned)
			? "Invalid card number"
			: undefined;
	},

	amount: (value: string) => {
		if (!value || value.trim() === "") return "Amount is required";
		const numValue = parseFloat(value.replace(/,/g, ""));
		if (isNaN(numValue)) return "Invalid amount";
		if (numValue <= 0) return "Amount must be greater than 0";
		if (numValue > 999999999) return "Amount is too large";
		return undefined;
	},
};

/**
 * Compose multiple validation rules
 */
export const composeValidators =
	(...validators: ValidationRule[]): ValidationRule =>
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
	validationSchema: Partial<Record<keyof T, ValidationRule>>,
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
	const cleaned = value.replace(/\s/g, "");
	const match = cleaned.match(/.{1,4}/g);
	return match ? match.join(" ") : cleaned;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (value: string): string => {
	const cleaned = value.replace(/\D/g, "");
	const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
	if (match) {
		return [match[1], match[2], match[3]].filter(Boolean).join(" ");
	}
	return cleaned;
};
