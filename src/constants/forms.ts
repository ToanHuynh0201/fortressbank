/**
 * Form configuration constants and presets
 * Centralized form styling and behavior configurations
 */

// Form field presets
export const FIELD_PRESETS = {
    email: {
        type: "email" as const,
        placeholder: "Enter your email address",
        autoComplete: "email" as const,
        inputMode: "email" as const,
    },
    password: {
        type: "password",
        placeholder: "Enter your password",
        autoComplete: "current-password",
    },
    newPassword: {
        type: "password",
        placeholder: "Create a strong password",
        autoComplete: "new-password",
    },
    confirmPassword: {
        type: "password",
        placeholder: "Confirm your password",
        autoComplete: "new-password",
    },
    name: {
        type: "text",
        placeholder: "Enter your full name",
        autoComplete: "name",
    },
    phone: {
        type: "tel",
        placeholder: "Enter your phone number",
        autoComplete: "tel",
        inputMode: "tel",
    },
};

// Form validation modes
export const VALIDATION_MODES = {
    onChange: "onChange",
    onBlur: "onBlur",
    onSubmit: "onSubmit",
    all: "all",
} as const;

// Form sizes
export const FORM_SIZES = {
    sm: "sm",
    md: "md",
    lg: "lg",
};

// Form themes
export const FORM_THEMES = {
    default: {
        focusBorderColor: "blue.500",
        errorBorderColor: "red.500",
    },
    success: {
        focusBorderColor: "green.500",
        errorBorderColor: "red.500",
    },
    warning: {
        focusBorderColor: "orange.500",
        errorBorderColor: "red.500",
    },
};

export default {
    FIELD_PRESETS,
    VALIDATION_MODES,
    FORM_SIZES,
    FORM_THEMES,
};
