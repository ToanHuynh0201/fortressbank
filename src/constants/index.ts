import Constants from "expo-constants";

/**
 * Application constants
 * Centralized location for all application constants
 */

// Get environment variables from expo-constants
const expoConfig = Constants.expoConfig;
const extra = expoConfig?.extra || {};

// API Configuration
export const API_CONFIG = {
    BASE_URL: extra.API_BASE_URL || "http://localhost:3000/api",
    LOCATION_URL: extra.API_LOCATION_URL || "http://localhost:3030/api",
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};

export const ROLES = {
    ADMIN: "ADMIN",
    USER: "USER",
};

// Auth Configuration
export const AUTH_CONFIG = {
    TOKEN_STORAGE_KEY: "access_token",
    REFRESH_TOKEN_STORAGE_KEY: "refresh_token",
    USER_STORAGE_KEY: "user",
    REQUIRED_ROLE: ROLES.ADMIN,
};

// Route Paths
export const ROUTES = {
    LOGIN: "/login",
    RECIPE: "/recipe",
    HOME: "/home",
    MENU_SUGGESTION: "/menu-suggestion",
    PROFILE: "/profile",
    ROOT: "/",
};

// Form Validation
export const VALIDATION = {
    EMAIL_MAX_LENGTH: 254,
    PASSWORD_MAX_LENGTH: 128,
    STRONG_PASSWORD_MIN_LENGTH: 8,
    NAME_MAX_LENGTH: 100,
    PASSWORD_PATTERN:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
};

// Error Codes from Backend
export const ERROR_CODES = {
    BAD_REQUEST: "BAD_REQUEST",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    CONFLICT: "CONFLICT",
    TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    NETWORK_ERROR: "NETWORK_ERROR",
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
    UNAUTHORIZED: "You are not authorized to access this resource.",
    FORBIDDEN: "Access denied. Administrator privileges required.",
    SERVER_ERROR: "Server error. Please try again later.",
    VALIDATION_FAILED: "Please check your input and try again.",
    LOGIN_FAILED: "Invalid email or password. Please try again.",
    GENERIC_ERROR: "Something went wrong. Please try again.",
    BAD_REQUEST: "Invalid request. Please check your input and try again.",
    NOT_FOUND: "The requested resource was not found.",
    CONFLICT: "There was a conflict with your request. Please try again.",
    TOO_MANY_REQUESTS: "Too many requests. Please wait a moment and try again.",
    SERVICE_UNAVAILABLE:
        "Service is temporarily unavailable. Please try again later.",
    INTERNAL_ERROR: "An internal error occurred. Please try again later.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
    DATA_SAVED: "Data saved successfully!",
    ACTION_COMPLETED: "Action completed successfully!",
};

// Re-export colors from colors.ts
export { colors, primary, neutral, semantic } from "./colors";
export type { PrimaryColor, NeutralColor, SemanticColor } from "./colors";

export default {
    API_CONFIG,
    AUTH_CONFIG,
    ROUTES,
    VALIDATION,
    ERROR_CODES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROLES,
};
