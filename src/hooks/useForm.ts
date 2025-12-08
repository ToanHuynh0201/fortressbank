import { useState, useCallback } from "react";

/**
 * Custom hook for form state management
 * Simplifies form handling with validation
 */
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
	const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>(
		{},
	);

	const handleChange = useCallback(
		(name: keyof T, value: any) => {
			setValues((prev) => ({ ...prev, [name]: value }));
			// Clear error when user starts typing
			if (errors[name]) {
				setErrors((prev) => ({ ...prev, [name]: undefined }));
			}
		},
		[errors],
	);

	const handleBlur = useCallback((name: keyof T) => {
		setTouched((prev) => ({ ...prev, [name]: true }));
	}, []);

	const setFieldValue = useCallback((name: keyof T, value: any) => {
		setValues((prev) => ({ ...prev, [name]: value }));
	}, []);

	const setFieldError = useCallback((name: keyof T, error: string) => {
		setErrors((prev) => ({ ...prev, [name]: error }));
	}, []);

	const resetForm = useCallback(() => {
		setValues(initialValues);
		setErrors({});
		setTouched({});
	}, [initialValues]);

	const validateField = useCallback(
		(name: keyof T, validator: (value: any) => string | undefined) => {
			const error = validator(values[name]);
			setErrors((prev) => ({ ...prev, [name]: error }));
			return !error;
		},
		[values],
	);

	const isValid =
		Object.keys(errors).length === 0 &&
		Object.values(values).every(
			(val) => val !== "" && val !== null && val !== undefined,
		);

	return {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		setFieldValue,
		setFieldError,
		setTouched,
		setErrors,
		setValues,
		resetForm,
		validateField,
		isValid,
	};
};
