/**
 * Date and time utility functions
 */

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date: Date | string | number, options = {}) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            ...options,
        });
    } catch (error) {
        console.warn("Error formatting date:", error);
        return "Invalid Date";
    }
};

/**
 * Format time to locale string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTime = (date: Date | string | number, options = {}) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            ...options,
        });
    } catch (error) {
        console.warn("Error formatting time:", error);
        return "Invalid Time";
    }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date: Date | string | number) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - dateObj.getTime()) / 1000
        );

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000)
            return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return formatDate(dateObj);
    } catch (error) {
        console.warn("Error getting relative time:", error);
        return "Unknown";
    }
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is today
 */
export const isToday = (date: Date | string | number) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        const today = new Date();
        return dateObj.toDateString() === today.toDateString();
    } catch {
        return false;
    }
};
