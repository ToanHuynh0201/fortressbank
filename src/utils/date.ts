/**
 * Date and time utility functions
 */

/**
 * Convert GMT+0 timestamp to GMT+7 (Vietnam timezone)
 * @param {Date|string|number} date - Date in GMT+0
 * @returns {Date} Date object adjusted to GMT+7
 */
export const convertToGMT7 = (date: Date | string | number): Date => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        // Add 7 hours (7 * 60 * 60 * 1000 milliseconds) to convert GMT+0 to GMT+7
        const gmt7Date = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
        return gmt7Date;
    } catch (error) {
        console.warn("Error converting to GMT+7:", error);
        return new Date();
    }
};

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date: Date | string | number, options = {}) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        const gmt7Date = convertToGMT7(dateObj);
        return gmt7Date.toLocaleDateString("en-US", {
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
        const gmt7Date = convertToGMT7(dateObj);
        return gmt7Date.toLocaleTimeString("en-US", {
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
        const gmt7Date = convertToGMT7(dateObj);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - gmt7Date.getTime()) / 1000
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
        const gmt7Date = convertToGMT7(dateObj);
        const today = new Date();
        return gmt7Date.toDateString() === today.toDateString();
    } catch {
        return false;
    }
};
