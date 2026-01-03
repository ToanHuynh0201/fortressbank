/**
 * String utility functions
 */

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str: string) => {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str: string) => {
    if (!str || typeof str !== "string") return "";
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export const truncate = (str: string, maxLength: number, suffix = "...") => {
    if (!str || typeof str !== "string") return "";
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + suffix;
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials
 * @returns {string} Initials
 */
export const getInitials = (name: string, maxInitials = 2) => {
    if (!name || typeof name !== "string") return "";

    return name
        .split(" ")
        .filter((part) => part.length > 0)
        .slice(0, maxInitials)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

/**
 * Sanitize string for display
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str: string) => {
    if (!str || typeof str !== "string") return "";
    return str.replace(/[<>&"']/g, (char) => {
        const entities: Record<string, string> = {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[char] || char;
    });
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
export const generateRandomString = (
    length = 8,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
) => {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
};

/**
 * Convert Vietnamese phone number from 0... format to +84... format
 * @param {string} phoneNumber - Phone number in 0... format (e.g., "0912345678")
 * @returns {string} Phone number in +84... format (e.g., "+84912345678")
 */
export const convertPhoneToInternational = (phoneNumber: string): string => {
    if (!phoneNumber || typeof phoneNumber !== "string") return "";

    // Remove all spaces and special characters
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

    // If already in +84 format, return as is
    if (cleaned.startsWith("+84")) {
        return cleaned;
    }

    // If starts with 0, replace with +84
    if (cleaned.startsWith("0")) {
        return "+84" + cleaned.substring(1);
    }

    // If starts with 84, add +
    if (cleaned.startsWith("84")) {
        return "+" + cleaned;
    }

    // Otherwise, assume it's missing the leading 0 and add +84
    return "+84" + cleaned;
};
