import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage utilities for handling AsyncStorage operations safely in React Native
 */

/**
 * Safely get item from AsyncStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Promise<*>} Parsed value or default
 */
export const getStorageItem = async (key: string, defaultValue: any = null) => {
    try {
        const item = await AsyncStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading AsyncStorage key "${key}":`, error);
        return defaultValue;
    }
};

/**
 * Safely set item in AsyncStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {Promise<boolean>} Success status
 */
export const setStorageItem = async (key: string, value: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Error writing to AsyncStorage key "${key}":`, error);
        return false;
    }
};

/**
 * Safely remove item from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
export const removeStorageItem = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn(`Error removing AsyncStorage key "${key}":`, error);
        return false;
    }
};

/**
 * Clear all storage items
 * @param {string[]} keys - Array of keys to remove
 * @returns {Promise<boolean>} Success status
 */
export const clearStorageItems = async (keys: string[]) => {
    try {
        await AsyncStorage.multiRemove(keys);
        return true;
    } catch (error) {
        console.warn("Error clearing AsyncStorage items:", error);
        return false;
    }
};

/**
 * Check if AsyncStorage is available
 * @returns {Promise<boolean>} Availability status
 */
export const isStorageAvailable = async () => {
    try {
        const test = "__storage_test__";
        await AsyncStorage.setItem(test, test);
        await AsyncStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
};

/**
 * Clear all AsyncStorage data
 * @returns {Promise<boolean>} Success status
 */
export const clearStorage = async () => {
    try {
        await AsyncStorage.clear();
        return true;
    } catch (error) {
        console.warn("Error clearing all AsyncStorage:", error);
        return false;
    }
};
